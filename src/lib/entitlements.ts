import type {
  PlanEntitlements,
  HirerPlanSlug,
  CompanySubscription,
  Application,
  User,
} from '../types';

export const DEFAULT_PLAN_ENTITLEMENTS: Record<HirerPlanSlug, PlanEntitlements> = {
  free: {
    maxOpenJobs: 1,
    featuredAllowed: false,
    fullApplicantAccess: false,
    applicantPreviewLimit: 5,
  },
  premium: {
    maxOpenJobs: null,
    featuredAllowed: true,
    fullApplicantAccess: true,
    applicantPreviewLimit: 5,
  },
  custom: {
    maxOpenJobs: null,
    featuredAllowed: true,
    fullApplicantAccess: true,
    applicantPreviewLimit: 5,
  },
};

export function resolveEntitlements(
  subscription: CompanySubscription | undefined | null
): PlanEntitlements {
  const plan = subscription?.plan || 'free';
  const defaults = DEFAULT_PLAN_ENTITLEMENTS[plan];

  if (plan === 'custom' && subscription) {
    return {
      maxOpenJobs:
        subscription.maxOpenJobs !== undefined ? subscription.maxOpenJobs : defaults.maxOpenJobs,
      featuredAllowed:
        subscription.featuredAllowed !== undefined
          ? subscription.featuredAllowed
          : defaults.featuredAllowed,
      fullApplicantAccess:
        subscription.fullApplicantAccess !== undefined
          ? subscription.fullApplicantAccess
          : defaults.fullApplicantAccess,
      applicantPreviewLimit:
        subscription.applicantPreviewLimit !== undefined
          ? subscription.applicantPreviewLimit
          : defaults.applicantPreviewLimit,
    };
  }

  return { ...defaults };
}

export function defaultFreeSubscription(): CompanySubscription {
  return {
    plan: 'free',
    status: 'active',
    startedAt: new Date().toISOString(),
  };
}

export class PlanLimitError extends Error {
  code = 'PLAN_LIMIT' as const;

  constructor(message: string) {
    super(message);
    this.name = 'PlanLimitError';
  }
}

export function redactApplications(
  applications: (Application & { seeker?: User })[],
  entitlements: PlanEntitlements
) {
  const totalCount = applications.length;
  if (entitlements.fullApplicantAccess) {
    return { applications, previewCapped: false, totalCount };
  }

  const limited = applications.slice(0, entitlements.applicantPreviewLimit).map((app) => {
    const { resumeUrl: _, ...rest } = app;
    const seeker = app.seeker
      ? {
          ...app.seeker,
          phone: undefined,
          seekerProfile: app.seeker.seekerProfile
            ? { ...app.seeker.seekerProfile, resumeUrl: undefined }
            : undefined,
        }
      : undefined;
    return { ...rest, seeker };
  });

  return { applications: limited, previewCapped: true, totalCount };
}
