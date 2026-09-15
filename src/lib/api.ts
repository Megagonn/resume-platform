import type {
  AdminStats,
  ApplicationStatus,
  BlogPost,
  Company,
  CompanySubscription,
  CvPackage,
  HirerPlan,
  HirerPlanSlug,
  Job,
  OrderStatus,
  PlanEntitlements,
  SubscriptionStatus,
  User,
  UserRole,
} from '../types';
import { apiRequest } from './apiClient';
import { getStoredAuth, setStoredAuth } from './authStorage';
import {
  normalizeApplication,
  normalizeBlogPost,
  normalizeCompany,
  normalizeHirerPlan,
  normalizeJob,
  normalizeOrder,
  normalizePackage,
  normalizeServicePage,
  normalizeUser,
  refId,
} from './normalize';

export { getStoredAuth, setStoredAuth } from './authStorage';

export const api = {
  async login(email: string, password: string) {
    const res = await apiRequest<{ token: string; user: Record<string, unknown> }>(
      '/auth/login',
      { method: 'POST', body: { email, password }, auth: false }
    );
    const payload = { token: res.token, user: normalizeUser(res.user) };
    setStoredAuth(payload);
    return payload;
  },

  async signup(data: {
    email: string;
    password: string;
    name: string;
    role: 'seeker' | 'hirer';
    phone?: string;
    companyName?: string;
  }) {
    const res = await apiRequest<{ token: string; user: Record<string, unknown> }>(
      '/auth/signup',
      { method: 'POST', body: data, auth: false }
    );
    const payload = { token: res.token, user: normalizeUser(res.user) };
    setStoredAuth(payload);
    return payload;
  },

  async me() {
    const res = await apiRequest<{ user: Record<string, unknown> }>('/auth/me');
    const user = normalizeUser(res.user);
    const auth = getStoredAuth();
    if (auth) setStoredAuth({ ...auth, user });
    return { user };
  },

  logout() {
    setStoredAuth(null);
  },

  async listJobs(filters?: {
    type?: string;
    location?: string;
    remote?: string;
    q?: string;
    status?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.location) params.set('location', filters.location);
    if (filters?.remote) params.set('remote', filters.remote);
    if (filters?.q) params.set('q', filters.q);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString();
    const res = await apiRequest<{ jobs: Record<string, unknown>[] }>(
      `/jobs${qs ? `?${qs}` : ''}`,
      { auth: false }
    );
    return { jobs: res.jobs.map(normalizeJob) };
  },

  async getJob(jobId: string) {
    const res = await apiRequest<{ job: Record<string, unknown> }>(`/jobs/${jobId}`, {
      auth: false,
    });
    return { job: normalizeJob(res.job) };
  },

  async listPackages(all = false) {
    const res = await apiRequest<{ packages: Record<string, unknown>[] }>(
      `/packages${all ? '?all=true' : ''}`,
      { auth: false }
    );
    return { packages: res.packages.map(normalizePackage) };
  },

  async getPackage(idOrSlug: string) {
    const { packages } = await this.listPackages(true);
    const pkg = packages.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    if (!pkg) throw new Error('Package not found');
    return { package: pkg };
  },

  async listServicePages(publishedOnly = true) {
    const res = await apiRequest<{ pages: Record<string, unknown>[] }>('/services', {
      auth: false,
    });
    let pages = res.pages.map(normalizeServicePage);
    if (publishedOnly) pages = pages.filter((p) => p.published);
    return { pages };
  },

  async getServicePage(slug: string, allowUnpublished = false) {
    try {
      const res = await apiRequest<{ page: Record<string, unknown> }>(`/services/${slug}`, {
        auth: false,
      });
      const page = normalizeServicePage(res.page);
      if (!allowUnpublished && !page.published) throw new Error('Service page not found');
      return { page };
    } catch {
      throw new Error('Service page not found');
    }
  },

  async listHirerPlans(all = false) {
    const path = all ? '/admin/hirer-plans' : '/hirer-plans';
    const res = await apiRequest<{ plans: Record<string, unknown>[] }>(path, {
      auth: all,
    });
    return { plans: res.plans.map(normalizeHirerPlan) };
  },

  async getSubscription(_hirerId: string) {
    const res = await apiRequest<{
      company: Record<string, unknown>;
      subscription: CompanySubscription;
      entitlements: PlanEntitlements;
      usage: { openJobs: number };
      plan: Record<string, unknown> | null;
    }>('/hirer/subscription');
    return {
      company: normalizeCompany(res.company),
      subscription: {
        ...res.subscription,
        startedAt:
          typeof res.subscription.startedAt === 'string'
            ? res.subscription.startedAt
            : new Date(String(res.subscription.startedAt)).toISOString(),
        renewsAt: res.subscription.renewsAt
          ? typeof res.subscription.renewsAt === 'string'
            ? res.subscription.renewsAt
            : new Date(String(res.subscription.renewsAt)).toISOString()
          : undefined,
      },
      entitlements: res.entitlements,
      usage: res.usage,
      plan: res.plan ? normalizeHirerPlan(res.plan) : undefined,
    };
  },

  async upgradeSubscription(_hirerId: string) {
    await apiRequest('/hirer/subscription/upgrade', { method: 'POST' });
    return this.getSubscription(_hirerId);
  },

  async createOrder(
    _seekerId: string,
    packageId: string,
    options?: {
      notes?: string;
      markPaid?: boolean;
      attachmentFileUrl?: string;
      attachmentFileName?: string;
      file?: File;
    }
  ) {
    let attachmentFileUrl = options?.attachmentFileUrl;
    let attachmentFileName = options?.attachmentFileName;

    if (options?.file) {
      const uploaded = await this.uploadDocument(options.file);
      attachmentFileUrl = uploaded.file.url;
      attachmentFileName = options.file.name;
    }

    const res = await apiRequest<{ order: Record<string, unknown> }>('/orders', {
      method: 'POST',
      body: {
        packageId,
        notes: options?.notes,
        markPaid: options?.markPaid !== false,
        attachmentFileUrl,
        attachmentFileName,
      },
    });
    return { order: normalizeOrder(res.order) };
  },

  async listSeekerOrders(_seekerId: string) {
    const res = await apiRequest<{ orders: Record<string, unknown>[] }>('/seeker/orders');
    return { orders: res.orders.map(normalizeOrder) };
  },

  async applyToJob(
    jobId: string,
    _seekerId: string,
    data: { coverNote?: string; resumeUrl?: string; resumeFile?: File }
  ) {
    if (data.resumeFile) {
      const form = new FormData();
      form.append('file', data.resumeFile);
      if (data.coverNote) form.append('coverNote', data.coverNote);
      const res = await apiRequest<{ application: Record<string, unknown> }>(
        `/jobs/${jobId}/applications`,
        { method: 'POST', formData: form }
      );
      return { application: normalizeApplication(res.application) };
    }

    const res = await apiRequest<{ application: Record<string, unknown> }>(
      `/jobs/${jobId}/applications`,
      {
        method: 'POST',
        body: { coverNote: data.coverNote, resumeUrl: data.resumeUrl },
      }
    );
    return { application: normalizeApplication(res.application) };
  },

  async listSeekerApplications(_seekerId: string) {
    const res = await apiRequest<{ applications: Record<string, unknown>[] }>(
      '/seeker/applications'
    );
    return { applications: res.applications.map(normalizeApplication) };
  },

  async updateSeekerProfile(
    _userId: string,
    data: Partial<User> & { seekerProfile?: User['seekerProfile'] }
  ) {
    const res = await apiRequest<{ user: Record<string, unknown> }>('/seeker/profile', {
      method: 'PATCH',
      body: {
        name: data.name,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        seekerProfile: data.seekerProfile,
      },
    });
    const user = normalizeUser(res.user);
    const auth = getStoredAuth();
    if (auth) setStoredAuth({ ...auth, user });
    return { user };
  },

  async updateHirerAccount(
    _userId: string,
    data: { name?: string; phone?: string; avatarUrl?: string }
  ) {
    const res = await apiRequest<{ user: Record<string, unknown> }>('/hirer/profile', {
      method: 'PATCH',
      body: data,
    });
    const user = normalizeUser(res.user);
    const auth = getStoredAuth();
    if (auth) setStoredAuth({ ...auth, user });
    return { user };
  },

  async getHirerAccount(_hirerId: string) {
    const res = await apiRequest<{
      user: Record<string, unknown>;
      company: Record<string, unknown> | null;
    }>('/hirer/profile');
    return {
      user: normalizeUser(res.user),
      company: res.company ? normalizeCompany(res.company) : undefined,
    };
  },

  async getCompany(_hirerId: string) {
    const res = await apiRequest<{ company: Record<string, unknown> }>('/hirer/company');
    return { company: normalizeCompany(res.company) };
  },

  async updateCompany(
    _hirerId: string,
    data: Partial<Omit<Company, 'id' | 'hirerId' | 'subscription'>>
  ) {
    const res = await apiRequest<{ company: Record<string, unknown> }>('/hirer/company', {
      method: 'PATCH',
      body: data,
    });
    return { company: normalizeCompany(res.company) };
  },

  async listHirerJobs(_hirerId: string) {
    const res = await apiRequest<{ jobs: Record<string, unknown>[] }>('/hirer/jobs');
    return { jobs: res.jobs.map(normalizeJob) };
  },

  async createJob(
    _hirerId: string,
    data: Omit<Job, 'id' | 'companyId' | 'hirerId' | 'createdAt'>
  ) {
    const res = await apiRequest<{ job: Record<string, unknown> }>('/hirer/jobs', {
      method: 'POST',
      body: data,
    });
    return { job: normalizeJob(res.job) };
  },

  async updateJob(_hirerId: string, jobId: string, data: Partial<Job>) {
    const res = await apiRequest<{ job: Record<string, unknown> }>(`/hirer/jobs/${jobId}`, {
      method: 'PATCH',
      body: data,
    });
    return { job: normalizeJob(res.job) };
  },

  async deleteJob(_hirerId: string, jobId: string) {
    return apiRequest<{ message: string }>(`/hirer/jobs/${jobId}`, { method: 'DELETE' });
  },

  async listJobApplications(_hirerId: string, jobId: string) {
    const [appsRes, jobsRes] = await Promise.all([
      apiRequest<{
        applications: Record<string, unknown>[];
        previewCapped: boolean;
        totalCount: number;
        entitlements: PlanEntitlements;
      }>(`/hirer/jobs/${jobId}/applications`),
      this.listHirerJobs(_hirerId),
    ]);
    const job = jobsRes.jobs.find((j) => j.id === jobId);
    if (!job) throw new Error('Job not found');
    return {
      applications: appsRes.applications.map(normalizeApplication),
      previewCapped: appsRes.previewCapped,
      totalCount: appsRes.totalCount,
      entitlements: appsRes.entitlements,
      job,
    };
  },

  async updateApplicationStatus(
    _actorId: string,
    applicationId: string,
    status: ApplicationStatus,
    note?: string,
    _isAdmin = false
  ) {
    const res = await apiRequest<{ application: Record<string, unknown> }>(
      `/hirer/applications/${applicationId}`,
      { method: 'PATCH', body: { status, note } }
    );
    return { application: normalizeApplication(res.application) };
  },

  async adminStats(): Promise<{ stats: AdminStats }> {
    return apiRequest<{ stats: AdminStats }>('/admin/stats');
  },

  async adminUsers() {
    const [{ users }, { applications }, { orders }, { jobs }, { companies }] = await Promise.all([
      apiRequest<{ users: Record<string, unknown>[] }>('/admin/users'),
      apiRequest<{ applications: Record<string, unknown>[] }>('/admin/applications'),
      apiRequest<{ orders: Record<string, unknown>[] }>('/admin/orders'),
      apiRequest<{ jobs: Record<string, unknown>[] }>('/admin/jobs'),
      apiRequest<{ companies: Record<string, unknown>[] }>('/admin/companies'),
    ]);

    const normalizedApps = applications.map(normalizeApplication);
    const normalizedOrders = orders.map(normalizeOrder);
    const normalizedJobs = jobs.map(normalizeJob);
    const companyByHirer = new Map(
      companies.map((c) => [refId(c.hirerId), normalizeCompany(c)])
    );

    return {
      users: users.map((raw) => {
        const user = normalizeUser(raw);
        return {
          ...user,
          company: companyByHirer.get(user.id),
          stats: {
            applications: normalizedApps.filter((a) => a.seekerId === user.id).length,
            orders: normalizedOrders.filter((o) => o.seekerId === user.id).length,
            jobsPosted: normalizedJobs.filter((j) => j.hirerId === user.id).length,
            openJobs: normalizedJobs.filter((j) => j.hirerId === user.id && j.status === 'open')
              .length,
            hired: normalizedApps.filter((a) => a.seekerId === user.id && a.status === 'hired')
              .length,
          },
        };
      }),
    };
  },

  async adminUserDetail(userId: string) {
    const { users } = await this.adminUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');

    const [{ applications }, { orders }, { jobs }] = await Promise.all([
      apiRequest<{ applications: Record<string, unknown>[] }>('/admin/applications'),
      apiRequest<{ orders: Record<string, unknown>[] }>('/admin/orders'),
      apiRequest<{ jobs: Record<string, unknown>[] }>('/admin/jobs'),
    ]);

    const userApps = applications.map(normalizeApplication).filter((a) => a.seekerId === userId);
    const userOrders = orders.map(normalizeOrder).filter((o) => o.seekerId === userId);
    const userJobs = jobs
      .map(normalizeJob)
      .filter((j) => j.hirerId === userId)
      .map((j) => ({
        ...j,
        applicationCount: applications.filter((a) => refId(a.jobId) === j.id).length,
      }));

    return {
      user,
      company: user.company,
      applications: userApps,
      orders: userOrders,
      jobs: userJobs,
      stats: user.stats,
      usage: user.company
        ? { openJobs: userJobs.filter((j) => j.status === 'open').length }
        : undefined,
    };
  },

  async adminUpdateUser(userId: string, data: { role?: UserRole; name?: string; phone?: string }) {
    const res = await apiRequest<{ user: Record<string, unknown> }>(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: data,
    });
    return { user: normalizeUser(res.user) };
  },

  async adminJobs() {
    const [{ jobs }, { applications }] = await Promise.all([
      apiRequest<{ jobs: Record<string, unknown>[] }>('/admin/jobs'),
      apiRequest<{ applications: Record<string, unknown>[] }>('/admin/applications'),
    ]);

    return {
      jobs: jobs.map((raw) => {
        const job = normalizeJob(raw);
        const hirerRaw = raw.hirerId;
        return {
          ...job,
          applicationCount: applications.filter((a) => refId(a.jobId) === job.id).length,
          hirer:
            hirerRaw && typeof hirerRaw === 'object'
              ? normalizeUser(hirerRaw as Record<string, unknown>)
              : undefined,
        };
      }),
    };
  },

  async adminJobDetail(jobId: string) {
    const [{ jobs }, { applications }] = await Promise.all([
      this.adminJobs(),
      apiRequest<{ applications: Record<string, unknown>[] }>('/admin/applications'),
    ]);
    const jobRow = jobs.find((j) => j.id === jobId);
    if (!jobRow) throw new Error('Job not found');
    const jobApps = applications
      .map(normalizeApplication)
      .filter((a) => a.jobId === jobId);
    return {
      job: jobRow,
      hirer: jobRow.hirer,
      applications: jobApps,
    };
  },

  async adminApplications() {
    const res = await apiRequest<{ applications: Record<string, unknown>[] }>(
      '/admin/applications'
    );
    return { applications: res.applications.map(normalizeApplication) };
  },

  async adminOrders() {
    const res = await apiRequest<{ orders: Record<string, unknown>[] }>('/admin/orders');
    return { orders: res.orders.map(normalizeOrder) };
  },

  async adminUpdateOrder(
    orderId: string,
    data: {
      status: OrderStatus;
      deliverables?: string;
      notes?: string;
      deliveryFileUrl?: string;
      deliveryFileName?: string;
    }
  ) {
    const res = await apiRequest<{ order: Record<string, unknown> }>(`/admin/orders/${orderId}`, {
      method: 'PATCH',
      body: data,
    });
    return { order: normalizeOrder(res.order) };
  },

  async adminDeliverOrder(
    orderId: string,
    data: { file?: File; deliverables?: string; notes?: string }
  ) {
    if (data.file) {
      const form = new FormData();
      form.append('file', data.file);
      if (data.deliverables) form.append('deliverables', data.deliverables);
      if (data.notes) form.append('notes', data.notes);
      const res = await apiRequest<{ order: Record<string, unknown>; message: string }>(
        `/admin/orders/${orderId}/deliver`,
        { method: 'POST', formData: form }
      );
      return { order: normalizeOrder(res.order), message: res.message };
    }

    const res = await apiRequest<{ order: Record<string, unknown>; message: string }>(
      `/admin/orders/${orderId}/deliver`,
      { method: 'POST', body: { deliverables: data.deliverables, notes: data.notes } }
    );
    return { order: normalizeOrder(res.order), message: res.message };
  },

  async uploadDocument(file: File) {
    const form = new FormData();
    form.append('file', file);
    const res = await apiRequest<{ file: { url: string; originalFilename?: string } }>(
      '/uploads/document',
      { method: 'POST', formData: form }
    );
    return {
      file: { url: res.file.url, originalName: res.file.originalFilename || file.name },
    };
  },

  async uploadImage(file: File) {
    const form = new FormData();
    form.append('file', file);
    const res = await apiRequest<{ file: { url: string; originalFilename?: string } }>(
      '/uploads/image',
      { method: 'POST', formData: form }
    );
    return {
      file: { url: res.file.url, originalName: res.file.originalFilename || file.name },
    };
  },

  async adminCreatePackage(data: Omit<CvPackage, 'id'>) {
    const res = await apiRequest<{ package: Record<string, unknown> }>('/admin/packages', {
      method: 'POST',
      body: data,
    });
    return { package: normalizePackage(res.package) };
  },

  async adminUpdatePackage(packageId: string, data: Partial<CvPackage>) {
    const res = await apiRequest<{ package: Record<string, unknown> }>(
      `/admin/packages/${packageId}`,
      { method: 'PATCH', body: data }
    );
    return { package: normalizePackage(res.package) };
  },

  async adminDeletePackage(packageId: string) {
    const res = await apiRequest<{ package: Record<string, unknown> }>(
      `/admin/packages/${packageId}`,
      { method: 'DELETE' }
    );
    return { package: normalizePackage(res.package) };
  },

  async adminPackages() {
    const [{ packages }, { orders }] = await Promise.all([
      apiRequest<{ packages: Record<string, unknown>[] }>('/admin/packages'),
      apiRequest<{ orders: Record<string, unknown>[] }>('/admin/orders'),
    ]);
    const normalizedOrders = orders.map(normalizeOrder);

    return {
      packages: packages.map((raw) => {
        const pkg = normalizePackage(raw);
        const related = normalizedOrders.filter((o) => o.packageId === pkg.id);
        return {
          ...pkg,
          stats: {
            orders: related.length,
            revenue: related
              .filter((o) => o.status !== 'cancelled' && o.status !== 'pending')
              .reduce((sum, o) => sum + o.amount, 0),
            pending: related.filter((o) =>
              ['pending', 'paid', 'in_progress'].includes(o.status)
            ).length,
            delivered: related.filter((o) => o.status === 'delivered').length,
          },
        };
      }),
    };
  },

  async adminPackageDetail(packageId: string) {
    const { packages } = await this.adminPackages();
    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) throw new Error('Package not found');
    const { orders } = await this.adminOrders();
    const related = orders.filter((o) => o.packageId === packageId);
    return { package: pkg, orders: related, stats: pkg.stats };
  },

  async adminCompanies() {
    const [{ companies }, { jobs }, { applications }] = await Promise.all([
      apiRequest<{ companies: Record<string, unknown>[] }>('/admin/companies'),
      apiRequest<{ jobs: Record<string, unknown>[] }>('/admin/jobs'),
      apiRequest<{ applications: Record<string, unknown>[] }>('/admin/applications'),
    ]);

    return {
      companies: companies.map((raw) => {
        const company = normalizeCompany(raw);
        const hirerRaw = raw.hirerId;
        const companyJobs = jobs.filter((j) => refId(j.companyId) === company.id);
        const jobIds = new Set(companyJobs.map((j) => refId(j._id ?? j.id)));
        return {
          ...company,
          hirer:
            hirerRaw && typeof hirerRaw === 'object'
              ? normalizeUser(hirerRaw as Record<string, unknown>)
              : undefined,
          entitlements: raw.entitlements as PlanEntitlements,
          usage: raw.usage as { openJobs: number },
          stats: {
            jobs: companyJobs.length,
            openJobs: (raw.usage as { openJobs?: number })?.openJobs ?? 0,
            applications: applications.filter((a) => jobIds.has(refId(a.jobId))).length,
          },
        };
      }),
    };
  },

  async adminCompanyDetail(companyId: string) {
    const [{ companies }, { jobs }, { applications }] = await Promise.all([
      this.adminCompanies(),
      apiRequest<{ jobs: Record<string, unknown>[] }>('/admin/jobs'),
      apiRequest<{ applications: Record<string, unknown>[] }>('/admin/applications'),
    ]);

    const companyRow = companies.find((c) => c.id === companyId);
    if (!companyRow) throw new Error('Company not found');

    const companyJobs = jobs
      .map(normalizeJob)
      .filter((j) => j.companyId === companyId)
      .map((j) => ({
        ...j,
        applicationCount: applications.filter((a) => refId(a.jobId) === j.id).length,
      }));
    const jobIds = new Set(companyJobs.map((j) => j.id));
    const companyApps = applications
      .map(normalizeApplication)
      .filter((a) => jobIds.has(a.jobId));

    return {
      company: companyRow,
      hirer: companyRow.hirer,
      entitlements: companyRow.entitlements,
      usage: companyRow.usage,
      jobs: companyJobs,
      applications: companyApps,
    };
  },

  async adminUpdateSubscription(
    companyId: string,
    data: {
      plan: HirerPlanSlug;
      status?: SubscriptionStatus;
      maxOpenJobs?: number | null;
      featuredAllowed?: boolean;
      fullApplicantAccess?: boolean;
      applicantPreviewLimit?: number;
      notes?: string;
      renewsAt?: string;
    }
  ) {
    const res = await apiRequest<{
      company: Record<string, unknown>;
      entitlements: PlanEntitlements;
      usage: { openJobs: number };
    }>(`/admin/companies/${companyId}/subscription`, { method: 'PATCH', body: data });
    return {
      company: normalizeCompany(res.company),
      entitlements: res.entitlements,
      usage: res.usage,
    };
  },

  async adminUpdateHirerPlan(planId: string, data: Partial<HirerPlan>) {
    const res = await apiRequest<{ plan: Record<string, unknown> }>(
      `/admin/hirer-plans/${planId}`,
      { method: 'PATCH', body: data }
    );
    return { plan: normalizeHirerPlan(res.plan) };
  },

  async listBlogPosts(publishedOnly = true, q?: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    const qs = params.toString();
    const path = publishedOnly ? `/blog${qs ? `?${qs}` : ''}` : `/admin/blog${qs ? `?${qs}` : ''}`;
    const res = await apiRequest<{ posts: Record<string, unknown>[] }>(path, {
      auth: !publishedOnly,
    });
    return { posts: res.posts.map(normalizeBlogPost) };
  },

  async getBlogPost(slug: string, allowUnpublished = false) {
    if (allowUnpublished) {
      const { posts } = await this.listBlogPosts(false);
      const post = posts.find((p) => p.slug === slug);
      if (!post) throw new Error('Post not found');
      return { post };
    }
    const res = await apiRequest<{ post: Record<string, unknown> }>(`/blog/${slug}`, {
      auth: false,
    });
    return { post: normalizeBlogPost(res.post) };
  },

  async adminListBlogPosts() {
    return this.listBlogPosts(false);
  },

  async adminCreateBlogPost(
    _authorId: string,
    data: Omit<BlogPost, 'id' | 'authorId' | 'createdAt' | 'updatedAt' | 'author'>
  ) {
    const res = await apiRequest<{ post: Record<string, unknown> }>('/admin/blog', {
      method: 'POST',
      body: data,
    });
    return { post: normalizeBlogPost(res.post) };
  },

  async adminUpdateBlogPost(postId: string, data: Partial<BlogPost>) {
    const res = await apiRequest<{ post: Record<string, unknown> }>(`/admin/blog/${postId}`, {
      method: 'PATCH',
      body: data,
    });
    return { post: normalizeBlogPost(res.post) };
  },

  async adminDeleteBlogPost(postId: string) {
    return apiRequest<{ message: string }>(`/admin/blog/${postId}`, { method: 'DELETE' });
  },

  resetDemoData() {
    setStoredAuth(null);
    localStorage.clear();
    window.location.reload();
  },
};

/** @deprecated Use `api` — kept for existing imports */
export const mockApi = api;
