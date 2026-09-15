import type {
  Application,
  BlogPost,
  Company,
  CvPackage,
  HirerPlan,
  Job,
  Order,
  ServicePage,
  User,
} from '../types';

function toIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return new Date(String(value)).toISOString();
}

export function refId(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const obj = value as { _id?: { toString(): string }; id?: string };
    if (obj._id) return obj._id.toString();
    if (obj.id) return obj.id;
  }
  return String(value);
}

function normalizeSubscription(raw: Record<string, unknown> | undefined) {
  if (!raw) {
    return { plan: 'free' as const, status: 'active' as const, startedAt: new Date().toISOString() };
  }
  return {
    plan: raw.plan as Company['subscription']['plan'],
    status: (raw.status as Company['subscription']['status']) || 'active',
    notes: raw.notes as string | undefined,
    startedAt: toIso(raw.startedAt),
    renewsAt: raw.renewsAt ? toIso(raw.renewsAt) : undefined,
    maxOpenJobs: raw.maxOpenJobs as number | null | undefined,
    featuredAllowed: raw.featuredAllowed as boolean | undefined,
    fullApplicantAccess: raw.fullApplicantAccess as boolean | undefined,
    applicantPreviewLimit: raw.applicantPreviewLimit as number | undefined,
  };
}

export function normalizeUser(raw: Record<string, unknown>): User {
  return {
    id: refId(raw._id ?? raw.id),
    email: String(raw.email),
    role: raw.role as User['role'],
    name: String(raw.name),
    phone: raw.phone as string | undefined,
    avatarUrl: raw.avatarUrl as string | undefined,
    seekerProfile: raw.seekerProfile as User['seekerProfile'],
    createdAt: toIso(raw.createdAt),
  };
}

export function normalizeCompany(raw: Record<string, unknown>): Company {
  return {
    id: refId(raw._id ?? raw.id),
    hirerId: refId(raw.hirerId),
    name: String(raw.name),
    logo: raw.logo as string | undefined,
    website: raw.website as string | undefined,
    about: raw.about as string | undefined,
    location: raw.location as string | undefined,
    subscription: normalizeSubscription(raw.subscription as Record<string, unknown>),
  };
}

export function normalizeJob(raw: Record<string, unknown>): Job {
  const companyRaw = raw.companyId;
  const company =
    companyRaw && typeof companyRaw === 'object'
      ? normalizeCompany({
          ...(companyRaw as Record<string, unknown>),
          hirerId: refId(raw.hirerId),
        })
      : undefined;

  return {
    id: refId(raw._id ?? raw.id),
    companyId: refId(companyRaw),
    hirerId: refId(raw.hirerId),
    title: String(raw.title),
    description: String(raw.description),
    type: raw.type as Job['type'],
    location: String(raw.location),
    remote: Boolean(raw.remote),
    salaryRange: raw.salaryRange as Job['salaryRange'],
    status: raw.status as Job['status'],
    featured: Boolean(raw.featured),
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    createdAt: toIso(raw.createdAt),
    company,
  };
}

export function normalizeApplication(raw: Record<string, unknown>): Application {
  const jobRaw = raw.jobId;
  const seekerRaw = raw.seekerId;

  return {
    id: refId(raw._id ?? raw.id),
    jobId: refId(jobRaw),
    seekerId: refId(seekerRaw),
    coverNote: raw.coverNote as string | undefined,
    resumeUrl: raw.resumeUrl as string | undefined,
    status: raw.status as Application['status'],
    timeline: Array.isArray(raw.timeline)
      ? (raw.timeline as Application['timeline']).map((t) => ({
          status: t.status,
          at: toIso(t.at),
          note: t.note,
        }))
      : [],
    createdAt: toIso(raw.createdAt),
    job:
      jobRaw && typeof jobRaw === 'object' && 'title' in (jobRaw as object)
        ? normalizeJob(jobRaw as Record<string, unknown>)
        : undefined,
    seeker:
      seekerRaw && typeof seekerRaw === 'object' && 'email' in (seekerRaw as object)
        ? normalizeUser(seekerRaw as Record<string, unknown>)
        : undefined,
  };
}

export function normalizePackage(raw: Record<string, unknown>): CvPackage {
  return {
    id: refId(raw._id ?? raw.id),
    slug: String(raw.slug),
    name: String(raw.name),
    price: Number(raw.price),
    currency: String(raw.currency || 'NGN'),
    description: String(raw.description),
    features: Array.isArray(raw.features) ? (raw.features as string[]) : [],
    popular: Boolean(raw.popular),
    sellaUrl: raw.sellaUrl as string | undefined,
    active: raw.active !== false,
  };
}

export function normalizeOrder(raw: Record<string, unknown>): Order {
  const packageRaw = raw.packageId;
  const seekerRaw = raw.seekerId;

  return {
    id: refId(raw._id ?? raw.id),
    seekerId: refId(seekerRaw),
    packageId: refId(packageRaw),
    amount: Number(raw.amount),
    currency: String(raw.currency || 'NGN'),
    status: raw.status as Order['status'],
    paymentRef: raw.paymentRef as string | undefined,
    notes: raw.notes as string | undefined,
    attachmentFileUrl: raw.attachmentFileUrl as string | undefined,
    attachmentFileName: raw.attachmentFileName as string | undefined,
    deliverables: raw.deliverables as string | undefined,
    deliveryFileUrl: raw.deliveryFileUrl as string | undefined,
    deliveryFileName: raw.deliveryFileName as string | undefined,
    deliveredAt: raw.deliveredAt ? toIso(raw.deliveredAt) : undefined,
    createdAt: toIso(raw.createdAt),
    package:
      packageRaw && typeof packageRaw === 'object' && 'slug' in (packageRaw as object)
        ? normalizePackage(packageRaw as Record<string, unknown>)
        : undefined,
    seeker:
      seekerRaw && typeof seekerRaw === 'object' && 'email' in (seekerRaw as object)
        ? normalizeUser(seekerRaw as Record<string, unknown>)
        : undefined,
  };
}

export function normalizeHirerPlan(raw: Record<string, unknown>): HirerPlan {
  return {
    id: refId(raw._id ?? raw.id),
    slug: raw.slug as HirerPlan['slug'],
    name: String(raw.name),
    price: raw.price === null || raw.price === undefined ? null : Number(raw.price),
    currency: String(raw.currency || 'NGN'),
    description: String(raw.description),
    features: Array.isArray(raw.features) ? (raw.features as string[]) : [],
    active: raw.active !== false,
    maxOpenJobs:
      raw.maxOpenJobs === null || raw.maxOpenJobs === undefined
        ? null
        : Number(raw.maxOpenJobs),
    featuredAllowed: Boolean(raw.featuredAllowed),
    fullApplicantAccess: Boolean(raw.fullApplicantAccess),
    applicantPreviewLimit: Number(raw.applicantPreviewLimit ?? 5),
  };
}

export function normalizeBlogPost(raw: Record<string, unknown>): BlogPost {
  const authorRaw = raw.authorId;

  return {
    id: refId(raw._id ?? raw.id),
    title: String(raw.title),
    slug: String(raw.slug),
    excerpt: String(raw.excerpt),
    content: String(raw.content),
    coverImage: raw.coverImage as string | undefined,
    authorId: refId(authorRaw),
    published: Boolean(raw.published),
    publishedAt: raw.publishedAt ? toIso(raw.publishedAt) : undefined,
    createdAt: toIso(raw.createdAt),
    updatedAt: toIso(raw.updatedAt),
    author:
      authorRaw && typeof authorRaw === 'object' && 'name' in (authorRaw as object)
        ? normalizeUser(authorRaw as Record<string, unknown>)
        : undefined,
  };
}

export function normalizeServicePage(raw: Record<string, unknown>): ServicePage {
  return {
    id: refId(raw._id ?? raw.id),
    slug: String(raw.slug),
    published: raw.published !== false,
    sortOrder: Number(raw.sortOrder ?? 0),
    metaTitle: String(raw.metaTitle ?? ''),
    metaDescription: String(raw.metaDescription ?? ''),
    keywords: Array.isArray(raw.keywords) ? (raw.keywords as string[]) : [],
    eyebrow: String(raw.eyebrow ?? ''),
    headline: String(raw.headline ?? ''),
    subheadline: String(raw.subheadline ?? ''),
    benefits: Array.isArray(raw.benefits) ? (raw.benefits as ServicePage['benefits']) : [],
    processSteps: Array.isArray(raw.processSteps)
      ? (raw.processSteps as ServicePage['processSteps'])
      : [],
    faqs: Array.isArray(raw.faqs) ? (raw.faqs as ServicePage['faqs']) : [],
    testimonials: Array.isArray(raw.testimonials)
      ? (raw.testimonials as ServicePage['testimonials'])
      : [],
    examples: Array.isArray(raw.examples) ? (raw.examples as ServicePage['examples']) : [],
    recommendedPackageSlug: String(raw.recommendedPackageSlug ?? 'standard'),
    primaryCtaLabel: String(raw.primaryCtaLabel ?? 'Get started'),
    primaryCtaHref: String(raw.primaryCtaHref ?? '/services'),
    createdAt: toIso(raw.createdAt),
    updatedAt: toIso(raw.updatedAt),
  };
}
