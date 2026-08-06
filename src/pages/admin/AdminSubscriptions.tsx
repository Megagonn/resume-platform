import { FormEvent, useEffect, useState } from 'react';
import { mockApi } from '../../lib/mockApi';
import { formatNaira } from '../../lib/utils';
import type { Company, HirerPlan, HirerPlanSlug, PlanEntitlements, User } from '../../types';
import {
  Badge,
  Button,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Spinner,
  Textarea,
} from '../../components/ui';

type CompanyRow = Company & {
  hirer?: User;
  entitlements: PlanEntitlements;
  usage: { openJobs: number };
};

export default function AdminSubscriptions() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [plans, setPlans] = useState<HirerPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [plan, setPlan] = useState<HirerPlanSlug>('free');
  const [notes, setNotes] = useState('');
  const [maxOpenJobs, setMaxOpenJobs] = useState('');
  const [featuredAllowed, setFeaturedAllowed] = useState(true);
  const [fullApplicantAccess, setFullApplicantAccess] = useState(true);
  const [applicantPreviewLimit, setApplicantPreviewLimit] = useState('5');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [premiumPrice, setPremiumPrice] = useState('');
  const [savingPlan, setSavingPlan] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [coRes, planRes] = await Promise.all([
        mockApi.adminCompanies(),
        mockApi.listHirerPlans(true),
      ]);
      setCompanies(coRes.companies as CompanyRow[]);
      setPlans(planRes.plans);
      const premium = planRes.plans.find((p) => p.slug === 'premium');
      if (premium?.price != null) setPremiumPrice(String(premium.price));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectCompany = (c: CompanyRow) => {
    setSelectedId(c.id);
    setPlan(c.subscription.plan);
    setNotes(c.subscription.notes || '');
    setMaxOpenJobs(
      c.subscription.maxOpenJobs === null
        ? ''
        : c.subscription.maxOpenJobs !== undefined
          ? String(c.subscription.maxOpenJobs)
          : ''
    );
    setFeaturedAllowed(c.subscription.featuredAllowed ?? true);
    setFullApplicantAccess(c.subscription.fullApplicantAccess ?? true);
    setApplicantPreviewLimit(String(c.subscription.applicantPreviewLimit ?? 5));
    setMessage('');
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    setMessage('');
    try {
      await mockApi.adminUpdateSubscription(selectedId, {
        plan,
        notes,
        maxOpenJobs:
          plan === 'custom'
            ? maxOpenJobs === ''
              ? null
              : Number(maxOpenJobs)
            : undefined,
        featuredAllowed: plan === 'custom' ? featuredAllowed : undefined,
        fullApplicantAccess: plan === 'custom' ? fullApplicantAccess : undefined,
        applicantPreviewLimit:
          plan === 'custom' ? Number(applicantPreviewLimit) || 5 : undefined,
      });
      setMessage('Subscription updated.');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const onSavePremiumPrice = async () => {
    const premium = plans.find((p) => p.slug === 'premium');
    if (!premium) return;
    setSavingPlan(true);
    try {
      await mockApi.adminUpdateHirerPlan(premium.id, {
        price: Number(premiumPrice) || 0,
      });
      await load();
    } finally {
      setSavingPlan(false);
    }
  };

  if (loading) return <Spinner />;

  const selected = companies.find((c) => c.id === selectedId);

  return (
    <div>
      <PageHeader
        title="Employer subscriptions"
        subtitle="Assign Free, Premium, or Custom plans to companies."
      />

      <div className="mb-8 max-w-md rounded-2xl border border-border bg-white p-5">
        <h3 className="font-semibold">Premium catalog price</h3>
        <div className="mt-3 flex gap-2">
          <Input
            type="number"
            value={premiumPrice}
            onChange={(e) => setPremiumPrice(e.target.value)}
            label="NGN / month"
          />
          <Button
            type="button"
            className="mt-6"
            variant="outline"
            disabled={savingPlan}
            onClick={onSavePremiumPrice}
          >
            Save
          </Button>
        </div>
      </div>

      {companies.length === 0 ? (
        <EmptyState title="No companies yet" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCompany(c)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedId === c.id
                    ? 'border-primary bg-primary-50'
                    : 'border-border bg-white hover:border-primary/30'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{c.name}</p>
                  <Badge tone="brand">{c.subscription.plan}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {c.hirer?.name} · {c.hirer?.email}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {c.usage.openJobs} open jobs · Featured{' '}
                  {c.entitlements.featuredAllowed ? 'yes' : 'no'}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            {selected ? (
              <form onSubmit={onSave} className="space-y-4">
                <h3 className="font-semibold">{selected.name}</h3>
                <Select
                  label="Plan"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as HirerPlanSlug)}
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="custom">Custom</option>
                </Select>
                {plan === 'custom' && (
                  <>
                    <Input
                      label="Max open jobs (blank = unlimited)"
                      type="number"
                      value={maxOpenJobs}
                      onChange={(e) => setMaxOpenJobs(e.target.value)}
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={featuredAllowed}
                        onChange={(e) => setFeaturedAllowed(e.target.checked)}
                      />
                      Featured listings allowed
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={fullApplicantAccess}
                        onChange={(e) => setFullApplicantAccess(e.target.checked)}
                      />
                      Full applicant access
                    </label>
                    {!fullApplicantAccess && (
                      <Input
                        label="Applicant preview limit"
                        type="number"
                        value={applicantPreviewLimit}
                        onChange={(e) => setApplicantPreviewLimit(e.target.value)}
                      />
                    )}
                  </>
                )}
                <Textarea
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                {message && <p className="text-sm text-primary">{message}</p>}
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save subscription'}
                </Button>
                <p className="text-xs text-ink-muted">
                  Catalog: {plans.map((p) => `${p.name} (${p.price === null ? 'custom' : formatNaira(p.price ?? 0)})`).join(' · ')}
                </p>
              </form>
            ) : (
              <p className="text-sm text-ink-muted">Select a company to edit its plan.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
