export type UserRole = 'seeker' | 'hirer' | 'admin';

export type JobType = 'full-time' | 'part-time' | 'contract' | 'gig';

export type JobStatus = 'draft' | 'open' | 'closed';

export type ApplicationStatus =
  | 'new'
  | 'reviewing'
  | 'shortlisted'
  | 'rejected'
  | 'hired';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'in_progress'
  | 'delivered'
  | 'cancelled';

export type HirerPlanSlug = 'free' | 'premium' | 'custom';

export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled';

export interface PlanEntitlements {
  maxOpenJobs: number | null;
  featuredAllowed: boolean;
  fullApplicantAccess: boolean;
  applicantPreviewLimit: number;
}

export interface CompanySubscription extends Partial<PlanEntitlements> {
  plan: HirerPlanSlug;
  status: SubscriptionStatus;
  notes?: string;
  startedAt: string;
  renewsAt?: string;
}

export interface HirerPlan {
  id: string;
  slug: HirerPlanSlug;
  name: string;
  price: number | null;
  currency: string;
  description: string;
  features: string[];
  active: boolean;
  maxOpenJobs: number | null;
  featuredAllowed: boolean;
  fullApplicantAccess: boolean;
  applicantPreviewLimit: number;
}

export interface SeekerProfile {
  headline?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  resumeUrl?: string;
  experienceYears?: number;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  avatarUrl?: string;
  seekerProfile?: SeekerProfile;
  password?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  hirerId: string;
  name: string;
  logo?: string;
  website?: string;
  about?: string;
  location?: string;
  subscription: CompanySubscription;
}

export interface SalaryRange {
  min?: number;
  max?: number;
  currency: string;
}

export interface Job {
  id: string;
  companyId: string;
  hirerId: string;
  title: string;
  description: string;
  type: JobType;
  location: string;
  remote: boolean;
  salaryRange?: SalaryRange;
  status: JobStatus;
  featured: boolean;
  tags: string[];
  createdAt: string;
  company?: Company;
}

export interface Application {
  id: string;
  jobId: string;
  seekerId: string;
  coverNote?: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  timeline: { status: ApplicationStatus; at: string; note?: string }[];
  createdAt: string;
  job?: Job;
  seeker?: User;
}

export interface CvPackage {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  popular: boolean;
  sellaUrl?: string;
  active: boolean;
}

export interface Order {
  id: string;
  seekerId: string;
  packageId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  paymentRef?: string;
  notes?: string;
  deliverables?: string;
  createdAt: string;
  package?: CvPackage;
  seeker?: User;
}

export interface AdminStats {
  users: number;
  seekers: number;
  hirers: number;
  jobs: number;
  openJobs: number;
  applications: number;
  orders: number;
  pendingOrders: number;
  packages: number;
  subscriptionsFree: number;
  subscriptionsPremium: number;
  subscriptionsCustom: number;
}

export interface SubscriptionUsage {
  openJobs: number;
  entitlements: PlanEntitlements;
}
