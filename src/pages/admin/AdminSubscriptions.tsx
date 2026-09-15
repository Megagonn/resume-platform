import { FormEvent, useEffect, useState } from 'react';
import { Globe, MapPin } from 'lucide-react';
import { useNotify } from '../../context/NotificationContext';
import { getErrorMessage } from '../../lib/errors';
import { mockApi } from '../../lib/mockApi';
import { formatNaira, statusLabel } from '../../lib/utils';
import type {
  Company,
  HirerPlan,
  HirerPlanSlug,
  Job,
  PlanEntitlements,
  User,
} from '../../types';
import {
  Avatar,
  Badge,
  Button,
  DetailBlock,
  Drawer,
  EmptyState,
  Input,
  MiniStat,
  PageHeader,
  SearchField,
  Select,
  Spinner,
  Textarea,
  statusTone,
} from '../../components/ui';

type CompanyRow = Company & {
  hirer?: User;
  entitlements: PlanEntitlements;
  usage: { openJobs: number };
  stats: { jobs: number; openJobs: number; applications: number };
};

type CompanyDetail = {
  company: Company;
  hirer?: User;
  entitlements: PlanEntitlements;
  usage: { openJobs: number };
  jobs: (Job & { applicationCount?: number })[];
  applications: { id: string; status: string; seeker?: User; job?: Job }[];
};

export default function AdminSubscriptions() {
  const { notifySuccess, notifyError } = useNotify();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [plans, setPlans] = useState<HirerPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [plan, setPlan] = useState<HirerPlanSlug>('free');
  const [notes, setNotes] = useState('');
  const [maxOpenJobs, setMaxOpenJobs] = useState('');
  const [featuredAllowed, setFeaturedAllowed] = useState(true);
  const [fullApplicantAccess, setFullApplicantAccess] = useState(true);
  const [applicantPreviewLimit, setApplicantPreviewLimit] = useState('5');
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    mockApi
      .adminCompanyDetail(selectedId)
      .then((res) => {
        const d = res as CompanyDetail;
        setDetail(d);
        setPlan(d.company.subscription.plan);
        setNotes(d.company.subscription.notes || '');
        setMaxOpenJobs(
          d.company.subscription.maxOpenJobs === null
            ? ''
            : d.company.subscription.maxOpenJobs !== undefined
              ? String(d.company.subscription.maxOpenJobs)
              : ''
        );
        setFeaturedAllowed(d.company.subscription.featuredAllowed ?? true);
        setFullApplicantAccess(d.company.subscription.fullApplicantAccess ?? true);
        setApplicantPreviewLimit(String(d.company.subscription.applicantPreviewLimit ?? 5));
      })
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    try {
      await mockApi.adminUpdateSubscription(selectedId, {
        plan,
        notes,
        maxOpenJobs:
          plan === 'custom' ? (maxOpenJobs === '' ? null : Number(maxOpenJobs)) : undefined,
        featuredAllowed: plan === 'custom' ? featuredAllowed : undefined,
        fullApplicantAccess: plan === 'custom' ? fullApplicantAccess : undefined,
        applicantPreviewLimit: plan === 'custom' ? Number(applicantPreviewLimit) || 5 : undefined,
      });
      notifySuccess('Subscription updated.');
      await load();
      const res = await mockApi.adminCompanyDetail(selectedId);
      setDetail(res as CompanyDetail);
    } catch (err) {
      notifyError(getErrorMessage(err, 'Update failed'));
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
      notifySuccess('Premium plan price updated.');
      await load();
    } catch (err) {
      notifyError(getErrorMessage(err, 'Failed to update plan price'));
    } finally {
      setSavingPlan(false);
    }
  };

  if (loading) return <Spinner />;

  const filtered = companies.filter((c) => {
    const query = q.trim().toLowerCase();
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      (c.hirer?.name || '').toLowerCase().includes(query) ||
      (c.hirer?.email || '').toLowerCase().includes(query) ||
      (c.location || '').toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle="Hirer profiles, hiring stats, and subscription plans."
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SearchField
          className="lg:w-80"
          placeholder="Search company or hirer…"
          value={q}
          onChange={setQ}
        />
        <div className="flex max-w-md items-end gap-2 rounded-2xl border border-border bg-white p-4">
          <Input
            type="number"
            value={premiumPrice}
            onChange={(e) => setPremiumPrice(e.target.value)}
            label="Premium NGN / month"
          />
          <Button
            type="button"
            className="mb-0.5"
            variant="outline"
            disabled={savingPlan}
            onClick={onSavePremiumPrice}
          >
            Save
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No companies yet" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className="rounded-2xl border border-border bg-white p-5 text-left shadow-sm shadow-primary/5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={c.name} src={c.logo} />
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-ink-muted">
                      {c.hirer?.name} · {c.hirer?.email}
                    </p>
                  </div>
                </div>
                <Badge tone={statusTone(c.subscription.plan)}>
                  {statusLabel(c.subscription.plan)}
                </Badge>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-ink-muted">
                {c.about || 'No company description yet.'}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <MiniStat label="Jobs" value={c.stats.jobs} />
                <MiniStat label="Open" value={c.stats.openJobs} />
                <MiniStat label="Apps" value={c.stats.applications} />
              </div>
            </button>
          ))}
        </div>
      )}

      <Drawer
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title={detail?.company.name || 'Company'}
        subtitle={detail?.hirer?.name}
        wide
      >
        {detailLoading || !detail ? (
          <Spinner />
        ) : (
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <Avatar name={detail.company.name} src={detail.company.logo} size="lg" />
              <div>
                <p className="font-semibold">{detail.company.name}</p>
                {detail.company.about && (
                  <p className="mt-1 text-sm text-ink-muted">{detail.company.about}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-muted">
                  {detail.company.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} /> {detail.company.location}
                    </span>
                  )}
                  {detail.company.website && (
                    <a
                      href={detail.company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Globe size={12} /> {detail.company.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniStat label="Jobs" value={detail.jobs.length} />
              <MiniStat label="Open" value={detail.usage.openJobs} />
              <MiniStat label="Applicants" value={detail.applications.length} />
              <MiniStat
                label="Featured"
                value={detail.entitlements.featuredAllowed ? 'Yes' : 'No'}
              />
            </div>

            {detail.hirer && (
              <DetailBlock title="Hirer account">
                <div className="flex items-center gap-3 rounded-2xl border border-border px-3 py-3">
                  <Avatar name={detail.hirer.name} src={detail.hirer.avatarUrl} />
                  <div>
                    <p className="text-sm font-medium">{detail.hirer.name}</p>
                    <p className="text-xs text-ink-muted">
                      {detail.hirer.email}
                      {detail.hirer.phone ? ` · ${detail.hirer.phone}` : ''}
                    </p>
                  </div>
                </div>
              </DetailBlock>
            )}

            <DetailBlock title="Openings">
              {detail.jobs.length === 0 ? (
                <p className="text-sm text-ink-muted">No jobs posted.</p>
              ) : (
                <ul className="space-y-2">
                  {detail.jobs.map((j) => (
                    <li
                      key={j.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2.5 text-sm"
                    >
                      <span className="font-medium">{j.title}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-ink-muted">
                          {j.applicationCount || 0} apps
                        </span>
                        <Badge tone={statusTone(j.status)}>{statusLabel(j.status)}</Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </DetailBlock>

            <form onSubmit={onSave} className="space-y-4 rounded-2xl border border-border p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Subscription
              </h3>
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
              <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save subscription'}
              </Button>
              <p className="text-xs text-ink-muted">
                Catalog:{' '}
                {plans
                  .map(
                    (p) =>
                      `${p.name} (${p.price === null ? 'custom' : formatNaira(p.price ?? 0)})`
                  )
                  .join(' · ')}
              </p>
            </form>
          </div>
        )}
      </Drawer>
    </div>
  );
}
