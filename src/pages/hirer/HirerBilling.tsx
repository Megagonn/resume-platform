import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotify } from '../../context/NotificationContext';
import { getErrorMessage } from '../../lib/errors';
import { mockApi } from '../../lib/mockApi';
import { formatNaira } from '../../lib/utils';
import type { HirerPlan, PlanEntitlements, CompanySubscription } from '../../types';
import { Badge, Button, PageHeader, Spinner } from '../../components/ui';

export default function HirerBilling() {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotify();
  const [plans, setPlans] = useState<HirerPlan[]>([]);
  const [subscription, setSubscription] = useState<CompanySubscription | null>(null);
  const [entitlements, setEntitlements] = useState<PlanEntitlements | null>(null);
  const [openJobs, setOpenJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [subRes, plansRes] = await Promise.all([
        mockApi.getSubscription(user.id),
        mockApi.listHirerPlans(),
      ]);
      setSubscription(subRes.subscription);
      setEntitlements(subRes.entitlements);
      setOpenJobs(subRes.usage.openJobs);
      setPlans(plansRes.plans);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const onUpgrade = async () => {
    if (!user) return;
    setUpgrading(true);
    try {
      await mockApi.upgradeSubscription(user.id);
      notifySuccess('Upgraded to Premium (mock payment).');
      await load();
    } catch (err) {
      notifyError(getErrorMessage(err, 'Upgrade failed'));
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) return <Spinner />;
  if (!subscription || !entitlements) return <p>Company profile required.</p>;

  const slotsLabel =
    entitlements.maxOpenJobs === null
      ? `${openJobs} open · Unlimited`
      : `${openJobs} / ${entitlements.maxOpenJobs} open jobs`;

  return (
    <div>
      <PageHeader
        title="Billing & plan"
        subtitle="Manage your employer subscription."
      />

      <div className="mb-8 rounded-2xl border border-border bg-white p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold capitalize">{subscription.plan} plan</h2>
          <Badge tone="brand">{subscription.status}</Badge>
        </div>
        <p className="mt-2 text-sm text-ink-muted">Usage: {slotsLabel}</p>
        <ul className="mt-4 space-y-2 text-sm text-ink-muted">
          <li>
            Featured listings:{' '}
            {entitlements.featuredAllowed ? 'Included' : 'Not included'}
          </li>
          <li>
            Applicant access:{' '}
            {entitlements.fullApplicantAccess
              ? 'Full pipeline'
              : `Preview (first ${entitlements.applicantPreviewLimit})`}
          </li>
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const current = plan.slug === subscription.plan;
          return (
            <div
              key={plan.id}
              className={`rounded-2xl border bg-white p-6 ${
                current ? 'border-primary shadow-soft' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {current && <Badge tone="brand">Current</Badge>}
              </div>
              <p className="mt-2 font-display text-2xl text-primary">
                {plan.price === null
                  ? 'Custom'
                  : plan.price === 0
                    ? 'Free'
                    : `${formatNaira(plan.price)}/mo`}
              </p>
              <p className="mt-2 text-sm text-ink-muted">{plan.description}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {plan.slug === 'premium' && subscription.plan === 'free' && (
                  <Button className="w-full" disabled={upgrading} onClick={onUpgrade}>
                    {upgrading ? 'Upgrading…' : 'Upgrade (mock)'}
                  </Button>
                )}
                {plan.slug === 'custom' && subscription.plan !== 'custom' && (
                  <p className="text-sm text-ink-muted">
                    Custom plans are assigned by our team.{' '}
                    <a
                      href="mailto:hannah.cvwriter@gmail.com"
                      className="text-primary underline"
                    >
                      Contact us
                    </a>
                    .
                  </p>
                )}
                {current && plan.slug === 'premium' && (
                  <p className="text-sm text-ink-muted">You are on Premium.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-ink-muted">
        Need help?{' '}
        <Link to="/hirer/company" className="text-primary underline">
          Update company profile
        </Link>
      </p>
    </div>
  );
}
