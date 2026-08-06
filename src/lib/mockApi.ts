import type {
  User,
  Company,
  Job,
  Application,
  CvPackage,
  Order,
  AdminStats,
  JobStatus,
  ApplicationStatus,
  OrderStatus,
  UserRole,
  HirerPlan,
  HirerPlanSlug,
  CompanySubscription,
  SubscriptionStatus,
  BlogPost,
} from '../types';
import {
  users as seedUsers,
  companies as seedCompanies,
  jobs as seedJobs,
  applications as seedApplications,
  packages as seedPackages,
  orders as seedOrders,
  hirerPlans as seedHirerPlans,
  blogPosts as seedBlogPosts,
} from '../data/fixtures';
import {
  resolveEntitlements,
  defaultFreeSubscription,
  PlanLimitError,
  redactApplications,
} from './entitlements';

const STORAGE_KEY = 'ready-brand-mock-db-v5';
const AUTH_KEY = 'ready-brand-auth';

interface MockDb {
  users: User[];
  companies: Company[];
  jobs: Job[];
  applications: Application[];
  packages: CvPackage[];
  orders: Order[];
  hirerPlans: HirerPlan[];
  blogPosts: BlogPost[];
}

function delay(ms = 280) {
  return new Promise((r) => setTimeout(r, ms));
}

function migrateDb(db: MockDb): MockDb {
  if (!db.hirerPlans?.length) db.hirerPlans = structuredClone(seedHirerPlans);
  if (!db.blogPosts?.length) db.blogPosts = structuredClone(seedBlogPosts);
  else {
    // Backfill stock covers when missing
    const covers: Record<string, string> = {
      'cv-that-gets-past-ats': '/images/blog-ats-cv.jpg',
      'hiring-free-vs-premium': '/images/blog-hiring-plans.jpg',
    };
    db.blogPosts = db.blogPosts.map((p) =>
      p.coverImage ? p : { ...p, coverImage: covers[p.slug] }
    );
  }
  db.companies = db.companies.map((c) => ({
    ...c,
    subscription: c.subscription || defaultFreeSubscription(),
  }));
  db.jobs = db.jobs.map((j) => ({
    ...j,
    featured: j.featured ?? false,
  }));
  return db;
}

function loadDb(): MockDb {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return migrateDb(JSON.parse(raw) as MockDb);
    } catch {
      // fall through
    }
  }
  const db: MockDb = {
    users: structuredClone(seedUsers),
    companies: structuredClone(seedCompanies),
    jobs: structuredClone(seedJobs),
    applications: structuredClone(seedApplications),
    packages: structuredClone(seedPackages),
    orders: structuredClone(seedOrders),
    hirerPlans: structuredClone(seedHirerPlans),
    blogPosts: structuredClone(seedBlogPosts),
  };
  saveDb(db);
  return db;
}

function saveDb(db: MockDb) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function id(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function stripPassword(user: User): User {
  const { password: _, ...rest } = user;
  return rest;
}

function withCompany(job: Job, db: MockDb): Job {
  return {
    ...job,
    company: db.companies.find((c) => c.id === job.companyId),
  };
}

function countOpenJobs(db: MockDb, hirerId: string, excludeJobId?: string) {
  return db.jobs.filter(
    (j) => j.hirerId === hirerId && j.status === 'open' && j.id !== excludeJobId
  ).length;
}

function assertCanOpenJob(company: Company, db: MockDb, excludeJobId?: string) {
  const entitlements = resolveEntitlements(company.subscription);
  if (entitlements.maxOpenJobs === null) return;
  const openCount = countOpenJobs(db, company.hirerId, excludeJobId);
  if (openCount >= entitlements.maxOpenJobs) {
    throw new PlanLimitError(
      `Your ${company.subscription.plan} plan allows ${entitlements.maxOpenJobs} open job${
        entitlements.maxOpenJobs === 1 ? '' : 's'
      }. Upgrade to Premium for unlimited openings.`
    );
  }
}

function assertCanFeature(company: Company, featured: boolean) {
  if (!featured) return;
  const entitlements = resolveEntitlements(company.subscription);
  if (!entitlements.featuredAllowed) {
    throw new PlanLimitError(
      'Featured listings are available on Premium and Custom plans. Upgrade to feature this job.'
    );
  }
}

export function getStoredAuth(): { token: string; user: User } | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: { token: string; user: User } | null) {
  if (!auth) localStorage.removeItem(AUTH_KEY);
  else localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export const mockApi = {
  async login(email: string, password: string) {
    await delay();
    const db = loadDb();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) throw new Error('Invalid email or password');
    const payload = { token: `mock-token-${user.id}`, user: stripPassword(user) };
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
    await delay();
    const db = loadDb();
    if (db.users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Email already registered');
    }
    const user: User = {
      id: id('user'),
      email: data.email.toLowerCase(),
      password: data.password,
      name: data.name,
      role: data.role,
      phone: data.phone,
      seekerProfile: data.role === 'seeker' ? {} : undefined,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    if (data.role === 'hirer') {
      db.companies.push({
        id: id('co'),
        hirerId: user.id,
        name: data.companyName || `${data.name}'s Company`,
        subscription: defaultFreeSubscription(),
      });
    }
    saveDb(db);
    const payload = { token: `mock-token-${user.id}`, user: stripPassword(user) };
    setStoredAuth(payload);
    return payload;
  },

  async me() {
    await delay(120);
    const auth = getStoredAuth();
    if (!auth) throw new Error('Not authenticated');
    const db = loadDb();
    const user = db.users.find((u) => u.id === auth.user.id);
    if (!user) throw new Error('User not found');
    return { user: stripPassword(user) };
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
    await delay();
    const db = loadDb();
    let list = db.jobs.map((j) => withCompany(j, db));
    const status = filters?.status || 'open';
    list = list.filter((j) => j.status === status);
    if (filters?.type) list = list.filter((j) => j.type === filters.type);
    if (filters?.location)
      list = list.filter((j) =>
        j.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    if (filters?.remote === 'true') list = list.filter((j) => j.remote);
    if (filters?.remote === 'false') list = list.filter((j) => !j.remote);
    if (filters?.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return {
      jobs: list.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.createdAt.localeCompare(a.createdAt);
      }),
    };
  },

  async getJob(jobId: string) {
    await delay();
    const db = loadDb();
    const job = db.jobs.find((j) => j.id === jobId);
    if (!job) throw new Error('Job not found');
    return { job: withCompany(job, db) };
  },

  async listPackages(all = false) {
    await delay();
    const db = loadDb();
    return {
      packages: db.packages
        .filter((p) => all || p.active)
        .sort((a, b) => a.price - b.price),
    };
  },

  async getPackage(idOrSlug: string) {
    await delay();
    const db = loadDb();
    const pkg = db.packages.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    if (!pkg) throw new Error('Package not found');
    return { package: pkg };
  },

  async listHirerPlans(all = false) {
    await delay();
    const db = loadDb();
    return {
      plans: db.hirerPlans
        .filter((p) => all || p.active)
        .sort((a, b) => (a.price ?? 999999) - (b.price ?? 999999)),
    };
  },

  async getSubscription(hirerId: string) {
    await delay();
    const db = loadDb();
    const company = db.companies.find((c) => c.hirerId === hirerId);
    if (!company) throw new Error('Company not found');
    const entitlements = resolveEntitlements(company.subscription);
    const openJobs = countOpenJobs(db, hirerId);
    const plan = db.hirerPlans.find((p) => p.slug === company.subscription.plan);
    return {
      company,
      subscription: company.subscription,
      entitlements,
      usage: { openJobs },
      plan,
    };
  },

  async upgradeSubscription(hirerId: string) {
    await delay();
    const db = loadDb();
    const company = db.companies.find((c) => c.hirerId === hirerId);
    if (!company) throw new Error('Company not found');
    if (company.subscription.plan === 'custom') {
      throw new Error('Custom plans are managed by admin. Contact support to change your plan.');
    }
    const now = new Date();
    const renewsAt = new Date(now);
    renewsAt.setMonth(renewsAt.getMonth() + 1);
    company.subscription = {
      plan: 'premium',
      status: 'active',
      startedAt: now.toISOString(),
      renewsAt: renewsAt.toISOString(),
      notes: company.subscription.notes,
    };
    saveDb(db);
    return this.getSubscription(hirerId);
  },

  async createOrder(
    seekerId: string,
    packageId: string,
    options?: {
      notes?: string;
      markPaid?: boolean;
      attachmentFileUrl?: string;
      attachmentFileName?: string;
      file?: File;
    }
  ) {
    await delay();
    const db = loadDb();
    const pkg = db.packages.find((p) => p.id === packageId || p.slug === packageId);
    if (!pkg || !pkg.active) throw new Error('Package not found');

    let attachmentFileUrl = options?.attachmentFileUrl;
    let attachmentFileName = options?.attachmentFileName;
    if (options?.file) {
      const uploaded = await this.uploadDocument(options.file);
      attachmentFileUrl = uploaded.file.url;
      attachmentFileName = options.file.name;
    }

    const markPaid = options?.markPaid !== false;
    const order: Order = {
      id: id('ord'),
      seekerId,
      packageId: pkg.id,
      amount: pkg.price,
      currency: pkg.currency,
      status: markPaid ? 'paid' : 'pending',
      paymentRef: markPaid ? `mock_${Date.now()}` : undefined,
      notes: options?.notes,
      attachmentFileUrl,
      attachmentFileName,
      createdAt: new Date().toISOString(),
    };
    db.orders.unshift(order);
    saveDb(db);
    return { order: { ...order, package: pkg } };
  },

  async listSeekerOrders(seekerId: string) {
    await delay();
    const db = loadDb();
    const orders = db.orders
      .filter((o) => o.seekerId === seekerId)
      .map((o) => ({
        ...o,
        package: db.packages.find((p) => p.id === o.packageId),
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { orders };
  },

  async applyToJob(
    jobId: string,
    seekerId: string,
    data: { coverNote?: string; resumeUrl?: string; resumeFile?: File }
  ) {
    await delay();
    const db = loadDb();
    const job = db.jobs.find((j) => j.id === jobId);
    if (!job || job.status !== 'open') throw new Error('Job not available');
    if (db.applications.some((a) => a.jobId === jobId && a.seekerId === seekerId)) {
      throw new Error('Already applied to this job');
    }

    let resumeUrl = data.resumeUrl;
    if (data.resumeFile) {
      const uploaded = await this.uploadDocument(data.resumeFile);
      resumeUrl = uploaded.file.url;
    }

    const application: Application = {
      id: id('app'),
      jobId,
      seekerId,
      coverNote: data.coverNote,
      resumeUrl,
      status: 'new',
      timeline: [{ status: 'new', at: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    };
    db.applications.unshift(application);
    saveDb(db);
    return { application };
  },

  async listSeekerApplications(seekerId: string) {
    await delay();
    const db = loadDb();
    const applications = db.applications
      .filter((a) => a.seekerId === seekerId)
      .map((a) => {
        const job = db.jobs.find((j) => j.id === a.jobId);
        return {
          ...a,
          job: job ? withCompany(job, db) : undefined,
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { applications };
  },

  async updateSeekerProfile(userId: string, data: Partial<User>) {
    await delay();
    const db = loadDb();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    if (data.name) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;
    if (data.seekerProfile) {
      user.seekerProfile = { ...user.seekerProfile, ...data.seekerProfile };
    }
    saveDb(db);
    const auth = getStoredAuth();
    if (auth?.user.id === userId) {
      setStoredAuth({ ...auth, user: stripPassword(user) });
    }
    return { user: stripPassword(user) };
  },

  async updateHirerAccount(
    userId: string,
    data: { name?: string; phone?: string; avatarUrl?: string }
  ) {
    await delay();
    const db = loadDb();
    const user = db.users.find((u) => u.id === userId && u.role === 'hirer');
    if (!user) throw new Error('User not found');
    if (data.name) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;
    saveDb(db);
    const auth = getStoredAuth();
    if (auth?.user.id === userId) {
      setStoredAuth({ ...auth, user: stripPassword(user) });
    }
    return { user: stripPassword(user) };
  },

  async getHirerAccount(hirerId: string) {
    await delay();
    const db = loadDb();
    const user = db.users.find((u) => u.id === hirerId);
    if (!user) throw new Error('User not found');
    const company = db.companies.find((c) => c.hirerId === hirerId);
    return { user: stripPassword(user), company };
  },

  async getCompany(hirerId: string) {
    await delay();
    const db = loadDb();
    const company = db.companies.find((c) => c.hirerId === hirerId);
    if (!company) throw new Error('Company not found');
    return { company };
  },

  async updateCompany(
    hirerId: string,
    data: Partial<Omit<Company, 'id' | 'hirerId' | 'subscription'>>
  ) {
    await delay();
    const db = loadDb();
    let company = db.companies.find((c) => c.hirerId === hirerId);
    if (!company) {
      company = {
        id: id('co'),
        hirerId,
        name: data.name || 'My Company',
        ...data,
        subscription: defaultFreeSubscription(),
      };
      db.companies.push(company);
    } else {
      Object.assign(company, data);
    }
    saveDb(db);
    return { company };
  },

  async listHirerJobs(hirerId: string) {
    await delay();
    const db = loadDb();
    const jobs = db.jobs
      .filter((j) => j.hirerId === hirerId)
      .map((j) => withCompany(j, db))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { jobs };
  },

  async createJob(hirerId: string, data: Omit<Job, 'id' | 'companyId' | 'hirerId' | 'createdAt'>) {
    await delay();
    const db = loadDb();
    const company = db.companies.find((c) => c.hirerId === hirerId);
    if (!company) throw new Error('Create a company profile first');
    const status = data.status || 'open';
    const featured = data.featured ?? false;
    if (status === 'open') assertCanOpenJob(company, db);
    assertCanFeature(company, featured);
    const job: Job = {
      ...data,
      id: id('job'),
      companyId: company.id,
      hirerId,
      createdAt: new Date().toISOString(),
      tags: data.tags || [],
      remote: data.remote ?? false,
      status,
      featured,
    };
    db.jobs.unshift(job);
    saveDb(db);
    return { job: withCompany(job, db) };
  },

  async updateJob(hirerId: string, jobId: string, data: Partial<Job>) {
    await delay();
    const db = loadDb();
    const job = db.jobs.find((j) => j.id === jobId && j.hirerId === hirerId);
    if (!job) throw new Error('Job not found');
    const company = db.companies.find((c) => c.hirerId === hirerId);
    if (!company) throw new Error('Company profile required');
    const nextStatus = data.status ?? job.status;
    const nextFeatured = data.featured !== undefined ? data.featured : job.featured;
    if (nextStatus === 'open' && job.status !== 'open') {
      assertCanOpenJob(company, db, job.id);
    }
    assertCanFeature(company, nextFeatured);
    Object.assign(job, data);
    job.featured = nextFeatured;
    saveDb(db);
    return { job: withCompany(job, db) };
  },

  async deleteJob(hirerId: string, jobId: string) {
    await delay();
    const db = loadDb();
    const idx = db.jobs.findIndex((j) => j.id === jobId && j.hirerId === hirerId);
    if (idx < 0) throw new Error('Job not found');
    db.jobs.splice(idx, 1);
    db.applications = db.applications.filter((a) => a.jobId !== jobId);
    saveDb(db);
    return { message: 'Job deleted' };
  },

  async listJobApplications(hirerId: string, jobId: string) {
    await delay();
    const db = loadDb();
    const job = db.jobs.find((j) => j.id === jobId && j.hirerId === hirerId);
    if (!job) throw new Error('Job not found');
    const company = db.companies.find((c) => c.hirerId === hirerId);
    const entitlements = resolveEntitlements(company?.subscription);
    const all = db.applications
      .filter((a) => a.jobId === jobId)
      .map((a) => ({
        ...a,
        seeker: stripPassword(db.users.find((u) => u.id === a.seekerId)!),
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const result = redactApplications(all, entitlements);
    return {
      applications: result.applications,
      previewCapped: result.previewCapped,
      totalCount: result.totalCount,
      entitlements,
      job: withCompany(job, db),
    };
  },

  async updateApplicationStatus(
    actorId: string,
    applicationId: string,
    status: ApplicationStatus,
    note?: string,
    isAdmin = false
  ) {
    await delay();
    const db = loadDb();
    const application = db.applications.find((a) => a.id === applicationId);
    if (!application) throw new Error('Application not found');
    const job = db.jobs.find((j) => j.id === application.jobId);
    if (!job) throw new Error('Job not found');
    if (!isAdmin && job.hirerId !== actorId) throw new Error('Not allowed');
    application.status = status;
    application.timeline.push({ status, at: new Date().toISOString(), note });
    saveDb(db);
    return { application };
  },

  async adminStats(): Promise<{ stats: AdminStats }> {
    await delay();
    const db = loadDb();
    return {
      stats: {
        users: db.users.filter((u) => u.role !== 'admin').length,
        seekers: db.users.filter((u) => u.role === 'seeker').length,
        hirers: db.users.filter((u) => u.role === 'hirer').length,
        jobs: db.jobs.length,
        openJobs: db.jobs.filter((j) => j.status === 'open').length,
        applications: db.applications.length,
        orders: db.orders.length,
        pendingOrders: db.orders.filter((o) =>
          ['pending', 'paid', 'in_progress'].includes(o.status)
        ).length,
        packages: db.packages.filter((p) => p.active).length,
        subscriptionsFree: db.companies.filter((c) => c.subscription.plan === 'free').length,
        subscriptionsPremium: db.companies.filter((c) => c.subscription.plan === 'premium')
          .length,
        subscriptionsCustom: db.companies.filter((c) => c.subscription.plan === 'custom')
          .length,
      },
    };
  },

  async adminUsers() {
    await delay();
    const db = loadDb();
    return {
      users: db.users.map(stripPassword).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    };
  },

  async adminUpdateUser(userId: string, data: { role?: UserRole; name?: string; phone?: string }) {
    await delay();
    const db = loadDb();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    if (data.role) user.role = data.role;
    if (data.name) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    saveDb(db);
    return { user: stripPassword(user) };
  },

  async adminJobs() {
    await delay();
    const db = loadDb();
    return {
      jobs: db.jobs
        .map((j) => withCompany(j, db))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    };
  },

  async adminApplications() {
    await delay();
    const db = loadDb();
    return {
      applications: db.applications
        .map((a) => ({
          ...a,
          job: db.jobs.find((j) => j.id === a.jobId),
          seeker: stripPassword(db.users.find((u) => u.id === a.seekerId)!),
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    };
  },

  async adminOrders() {
    await delay();
    const db = loadDb();
    return {
      orders: db.orders
        .map((o) => ({
          ...o,
          package: db.packages.find((p) => p.id === o.packageId),
          seeker: stripPassword(db.users.find((u) => u.id === o.seekerId)!),
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    };
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
    await delay();
    const db = loadDb();
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    order.status = data.status;
    if (data.deliverables !== undefined) order.deliverables = data.deliverables;
    if (data.notes !== undefined) order.notes = data.notes;
    if (data.deliveryFileUrl !== undefined) order.deliveryFileUrl = data.deliveryFileUrl;
    if (data.deliveryFileName !== undefined) order.deliveryFileName = data.deliveryFileName;
    if (data.status === 'delivered') {
      order.deliveredAt = order.deliveredAt || new Date().toISOString();
    }
    saveDb(db);
    return {
      order: {
        ...order,
        package: db.packages.find((p) => p.id === order.packageId),
        seeker: stripPassword(db.users.find((u) => u.id === order.seekerId)!),
      },
    };
  },

  async adminDeliverOrder(
    orderId: string,
    data: { file?: File; deliverables?: string; notes?: string }
  ) {
    await delay(400);
    const db = loadDb();
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    if (data.file) {
      const uploaded = await this.uploadDocument(data.file);
      order.deliveryFileUrl = uploaded.file.url;
      order.deliveryFileName = data.file.name;
    }
    if (!order.deliveryFileUrl) {
      throw new Error('Upload a CV file to deliver this order');
    }
    if (data.deliverables !== undefined) order.deliverables = data.deliverables;
    if (data.notes !== undefined) order.notes = data.notes;
    order.status = 'delivered';
    order.deliveredAt = new Date().toISOString();
    saveDb(db);
    return {
      order: {
        ...order,
        package: db.packages.find((p) => p.id === order.packageId),
        seeker: stripPassword(db.users.find((u) => u.id === order.seekerId)!),
      },
      message: 'Order delivered',
    };
  },

  async uploadDocument(file: File) {
    await delay(200);
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      throw new Error('Please upload a PDF or Word document');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File must be under 10MB');
    }
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
    return { file: { url, originalName: file.name } };
  },

  async adminCreatePackage(data: Omit<CvPackage, 'id'>) {
    await delay();
    const db = loadDb();
    const pkg: CvPackage = { ...data, id: id('pkg') };
    db.packages.push(pkg);
    saveDb(db);
    return { package: pkg };
  },

  async adminUpdatePackage(packageId: string, data: Partial<CvPackage>) {
    await delay();
    const db = loadDb();
    const pkg = db.packages.find((p) => p.id === packageId);
    if (!pkg) throw new Error('Package not found');
    Object.assign(pkg, data);
    saveDb(db);
    return { package: pkg };
  },

  async adminDeletePackage(packageId: string) {
    await delay();
    const db = loadDb();
    const pkg = db.packages.find((p) => p.id === packageId);
    if (!pkg) throw new Error('Package not found');
    pkg.active = false;
    saveDb(db);
    return { package: pkg };
  },

  async adminCompanies() {
    await delay();
    const db = loadDb();
    const companies = db.companies.map((company) => {
      const hirer = db.users.find((u) => u.id === company.hirerId);
      return {
        ...company,
        hirer: hirer ? stripPassword(hirer) : undefined,
        entitlements: resolveEntitlements(company.subscription),
        usage: { openJobs: countOpenJobs(db, company.hirerId) },
      };
    });
    return { companies };
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
    await delay();
    const db = loadDb();
    const company = db.companies.find((c) => c.id === companyId);
    if (!company) throw new Error('Company not found');
    const plan = data.plan;
    const subscription: CompanySubscription = {
      plan,
      status: data.status || company.subscription.status || 'active',
      startedAt: company.subscription.startedAt || new Date().toISOString(),
      renewsAt: data.renewsAt ?? company.subscription.renewsAt,
      notes: data.notes !== undefined ? data.notes : company.subscription.notes,
    };
    if (plan === 'custom') {
      subscription.maxOpenJobs = data.maxOpenJobs;
      subscription.featuredAllowed = data.featuredAllowed;
      subscription.fullApplicantAccess = data.fullApplicantAccess;
      subscription.applicantPreviewLimit = data.applicantPreviewLimit;
    }
    company.subscription = subscription;
    const entitlements = resolveEntitlements(subscription);
    if (!entitlements.featuredAllowed) {
      db.jobs.forEach((j) => {
        if (j.hirerId === company.hirerId) j.featured = false;
      });
    }
    saveDb(db);
    return {
      company,
      entitlements,
      usage: { openJobs: countOpenJobs(db, company.hirerId) },
    };
  },

  async adminUpdateHirerPlan(planId: string, data: Partial<HirerPlan>) {
    await delay();
    const db = loadDb();
    const plan = db.hirerPlans.find((p) => p.id === planId);
    if (!plan) throw new Error('Plan not found');
    Object.assign(plan, data);
    saveDb(db);
    return { plan };
  },

  async listBlogPosts(publishedOnly = true, q?: string) {
    await delay();
    const db = loadDb();
    let list = db.blogPosts.map((p) => ({
      ...p,
      author: stripPassword(db.users.find((u) => u.id === p.authorId)!),
    }));
    if (publishedOnly) list = list.filter((p) => p.published);
    if (q) {
      const query = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.excerpt.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query)
      );
    }
    return {
      posts: list.sort((a, b) =>
        (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt)
      ),
    };
  },

  async getBlogPost(slug: string, allowUnpublished = false) {
    await delay();
    const db = loadDb();
    const post = db.blogPosts.find(
      (p) => p.slug === slug && (allowUnpublished || p.published)
    );
    if (!post) throw new Error('Post not found');
    return {
      post: {
        ...post,
        author: stripPassword(db.users.find((u) => u.id === post.authorId)!),
      },
    };
  },

  async adminListBlogPosts() {
    return this.listBlogPosts(false);
  },

  async adminCreateBlogPost(
    authorId: string,
    data: Omit<BlogPost, 'id' | 'authorId' | 'createdAt' | 'updatedAt' | 'author'>
  ) {
    await delay();
    const db = loadDb();
    const now = new Date().toISOString();
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    if (db.blogPosts.some((p) => p.slug === slug)) {
      throw new Error('Slug already exists');
    }
    const post: BlogPost = {
      ...data,
      id: id('blog'),
      slug,
      authorId,
      publishedAt: data.published ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };
    db.blogPosts.unshift(post);
    saveDb(db);
    return { post };
  },

  async adminUpdateBlogPost(postId: string, data: Partial<BlogPost>) {
    await delay();
    const db = loadDb();
    const post = db.blogPosts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    const wasPublished = post.published;
    Object.assign(post, data);
    post.updatedAt = new Date().toISOString();
    if (post.published && !wasPublished) {
      post.publishedAt = new Date().toISOString();
    }
    if (!post.published) {
      post.publishedAt = undefined;
    }
    saveDb(db);
    return { post };
  },

  async adminDeleteBlogPost(postId: string) {
    await delay();
    const db = loadDb();
    const idx = db.blogPosts.findIndex((p) => p.id === postId);
    if (idx < 0) throw new Error('Post not found');
    db.blogPosts.splice(idx, 1);
    saveDb(db);
    return { message: 'Post deleted' };
  },

  async uploadImage(file: File) {
    await delay(200);
    if (!file.type.startsWith('image/')) {
      throw new Error('Please choose an image file');
    }
    if (file.size > 4 * 1024 * 1024) {
      throw new Error('Image must be under 4MB');
    }
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });
    return { file: { url, originalName: file.name } };
  },

  resetDemoData() {
    localStorage.removeItem(STORAGE_KEY);
    loadDb();
  },
};

export type { JobStatus };
