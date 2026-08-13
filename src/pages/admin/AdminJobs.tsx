import { useEffect, useMemo, useState } from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { mockApi } from '../../lib/mockApi';
import { formatDate, formatNaira, jobTypeLabel, statusLabel } from '../../lib/utils';
import type { AdminJobRow, Application, Job, User } from '../../types';
import {
  Avatar,
  Badge,
  DetailBlock,
  Drawer,
  FilterPills,
  MiniStat,
  PageHeader,
  SearchField,
  Spinner,
  TableShell,
  Td,
  Th,
  statusTone,
} from '../../components/ui';

type JobDetail = {
  job: Job;
  hirer?: User;
  applications: Application[];
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState<AdminJobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<JobDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    mockApi
      .adminJobs()
      .then((res) => setJobs(res.jobs as AdminJobRow[]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    mockApi
      .adminJobDetail(selectedId)
      .then((res) => setDetail(res as JobDetail))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return jobs.filter((j) => {
      if (status !== 'all' && j.status !== status) return false;
      if (!query) return true;
      return (
        j.title.toLowerCase().includes(query) ||
        (j.company?.name || '').toLowerCase().includes(query) ||
        j.location.toLowerCase().includes(query) ||
        j.tags.some((t) => t.toLowerCase().includes(query))
      );
    });
  }, [jobs, q, status]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Jobs"
        subtitle="Every opening, with company context and applicant volume."
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterPills
          value={status}
          onChange={setStatus}
          options={[
            { id: 'all', label: `All (${jobs.length})` },
            { id: 'open', label: `Open (${jobs.filter((j) => j.status === 'open').length})` },
            { id: 'draft', label: `Draft (${jobs.filter((j) => j.status === 'draft').length})` },
            { id: 'closed', label: `Closed (${jobs.filter((j) => j.status === 'closed').length})` },
          ]}
        />
        <SearchField
          className="lg:w-80"
          placeholder="Search title, company, tags…"
          value={q}
          onChange={setQ}
        />
      </div>

      <TableShell minWidth="min-w-[960px]">
        <thead className="border-b border-border bg-surface-muted/50 text-ink-muted">
          <tr>
            <Th>Role</Th>
            <Th>Company</Th>
            <Th>Type</Th>
            <Th>Applicants</Th>
            <Th>Status</Th>
            <Th>Posted</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((j) => (
            <tr
              key={j.id}
              className="cursor-pointer border-b border-border last:border-0 transition hover:bg-primary-50/40"
              onClick={() => setSelectedId(j.id)}
            >
              <Td>
                <p className="font-semibold text-ink">{j.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                  <MapPin size={12} /> {j.location}
                  {j.remote ? ' · Remote' : ''}
                </p>
              </Td>
              <Td>
                <p>{j.company?.name}</p>
                {j.featured && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    <Sparkles size={12} /> Featured
                  </span>
                )}
              </Td>
              <Td>{jobTypeLabel(j.type)}</Td>
              <Td className="font-medium">{j.applicationCount}</Td>
              <Td>
                <Badge tone={statusTone(j.status)}>{statusLabel(j.status)}</Badge>
              </Td>
              <Td className="text-ink-muted">{formatDate(j.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </TableShell>

      <Drawer
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title={detail?.job.title || 'Job'}
        subtitle={detail?.job.company?.name}
        wide
      >
        {detailLoading || !detail ? (
          <Spinner />
        ) : (
          <JobDetailBody detail={detail} />
        )}
      </Drawer>
    </div>
  );
}

function JobDetailBody({ detail }: { detail: JobDetail }) {
  const { job, hirer, applications } = detail;
  const byStatus = applications.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Badge tone={statusTone(job.status)}>{statusLabel(job.status)}</Badge>
        <Badge tone="brand">{jobTypeLabel(job.type)}</Badge>
        {job.remote && <Badge>Remote</Badge>}
        {job.featured && <Badge tone="brand">Featured</Badge>}
        {job.tags.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniStat label="Applicants" value={applications.length} />
        <MiniStat label="Shortlisted" value={byStatus.shortlisted || 0} />
        <MiniStat label="Hired" value={byStatus.hired || 0} />
        <MiniStat
          label="Salary"
          value={
            job.salaryRange
              ? formatNaira(job.salaryRange.min || 0).replace('NGN', '').trim()
              : '—'
          }
        />
      </div>

      <DetailBlock title="Listing">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{job.description}</p>
        <p className="mt-3 text-xs text-ink-muted">
          {job.location} · Posted {formatDate(job.createdAt)}
          {job.salaryRange
            ? ` · ${formatNaira(job.salaryRange.min || 0)}${
                job.salaryRange.max ? ` – ${formatNaira(job.salaryRange.max)}` : '+'
              }`
            : ''}
        </p>
      </DetailBlock>

      <DetailBlock title="Company & hirer">
        <div className="rounded-2xl border border-border bg-surface-muted/40 p-4">
          <p className="font-semibold">{job.company?.name}</p>
          {job.company?.about && (
            <p className="mt-2 text-sm text-ink-muted">{job.company.about}</p>
          )}
          {hirer && (
            <div className="mt-4 flex items-center gap-3">
              <Avatar name={hirer.name} src={hirer.avatarUrl} size="sm" />
              <div>
                <p className="text-sm font-medium">{hirer.name}</p>
                <p className="text-xs text-ink-muted">{hirer.email}</p>
              </div>
            </div>
          )}
          {job.company?.subscription && (
            <div className="mt-3">
              <Badge tone="brand">{statusLabel(job.company.subscription.plan)} plan</Badge>
            </div>
          )}
        </div>
      </DetailBlock>

      <DetailBlock title="Applicants">
        {applications.length === 0 ? (
          <p className="text-sm text-ink-muted">No applications yet.</p>
        ) : (
          <ul className="space-y-2">
            {applications.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={a.seeker?.name} src={a.seeker?.avatarUrl} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{a.seeker?.name}</p>
                    <p className="text-xs text-ink-muted">{a.seeker?.email}</p>
                  </div>
                </div>
                <Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </DetailBlock>
    </div>
  );
}
