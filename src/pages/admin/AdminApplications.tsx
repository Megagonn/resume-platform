import { useEffect, useMemo, useState } from 'react';
import { mockApi } from '../../lib/mockApi';
import { formatDate, formatDateTime, statusLabel } from '../../lib/utils';
import type { Application } from '../../types';
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

export default function AdminApplications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    mockApi
      .adminApplications()
      .then((res) => setApps(res.applications))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return apps.filter((a) => {
      if (status !== 'all' && a.status !== status) return false;
      if (!query) return true;
      return (
        (a.seeker?.name || '').toLowerCase().includes(query) ||
        (a.seeker?.email || '').toLowerCase().includes(query) ||
        (a.job?.title || '').toLowerCase().includes(query) ||
        (a.job?.company?.name || '').toLowerCase().includes(query)
      );
    });
  }, [apps, q, status]);

  const selected = apps.find((a) => a.id === selectedId) || null;
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    apps.forEach((a) => {
      map[a.status] = (map[a.status] || 0) + 1;
    });
    return map;
  }, [apps]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle="Seeker notes, resumes, and pipeline status for every listing."
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterPills
          value={status}
          onChange={setStatus}
          options={[
            { id: 'all', label: `All (${apps.length})` },
            { id: 'new', label: `New (${counts.new || 0})` },
            { id: 'reviewing', label: `Reviewing (${counts.reviewing || 0})` },
            { id: 'shortlisted', label: `Shortlisted (${counts.shortlisted || 0})` },
            { id: 'rejected', label: `Rejected (${counts.rejected || 0})` },
            { id: 'hired', label: `Hired (${counts.hired || 0})` },
          ]}
        />
        <SearchField
          className="lg:w-80"
          placeholder="Search seeker, job, company…"
          value={q}
          onChange={setQ}
        />
      </div>

      <TableShell minWidth="min-w-[880px]">
        <thead className="border-b border-border bg-surface-muted/50 text-ink-muted">
          <tr>
            <Th>Seeker</Th>
            <Th>Role</Th>
            <Th>Company</Th>
            <Th>Status</Th>
            <Th>Applied</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a) => (
            <tr
              key={a.id}
              className="cursor-pointer border-b border-border last:border-0 transition hover:bg-primary-50/40"
              onClick={() => setSelectedId(a.id)}
            >
              <Td>
                <div className="flex items-center gap-3">
                  <Avatar name={a.seeker?.name} src={a.seeker?.avatarUrl} />
                  <div>
                    <p className="font-semibold">{a.seeker?.name}</p>
                    <p className="text-xs text-ink-muted">{a.seeker?.email}</p>
                  </div>
                </div>
              </Td>
              <Td className="font-medium">{a.job?.title}</Td>
              <Td className="text-ink-muted">{a.job?.company?.name || '—'}</Td>
              <Td>
                <Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>
              </Td>
              <Td className="text-ink-muted">{formatDate(a.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </TableShell>

      <Drawer
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.seeker?.name || 'Application'}
        subtitle={selected?.job?.title}
        wide
      >
        {selected && <ApplicationDetail app={selected} />}
      </Drawer>
    </div>
  );
}

function ApplicationDetail({ app }: { app: Application }) {
  const seeker = app.seeker;
  const profile = seeker?.seekerProfile;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <MiniStat label="Status" value={statusLabel(app.status)} />
        <MiniStat label="Applied" value={formatDate(app.createdAt)} />
        <MiniStat label="Updates" value={app.timeline.length} />
      </div>

      <DetailBlock title="Candidate">
        <div className="flex items-start gap-3">
          <Avatar name={seeker?.name} src={seeker?.avatarUrl} size="lg" />
          <div>
            <p className="font-semibold">{seeker?.name}</p>
            <p className="text-sm text-ink-muted">{profile?.headline || seeker?.email}</p>
            {profile?.location && (
              <p className="mt-1 text-xs text-ink-muted">{profile.location}</p>
            )}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        {profile?.bio && <p className="mt-3 text-sm leading-relaxed text-ink-muted">{profile.bio}</p>}
      </DetailBlock>

      <DetailBlock title="Role">
        <div className="rounded-2xl border border-border bg-surface-muted/40 p-4">
          <p className="font-semibold">{app.job?.title}</p>
          <p className="mt-1 text-sm text-ink-muted">
            {app.job?.company?.name} · {app.job?.location}
          </p>
        </div>
      </DetailBlock>

      {app.coverNote && (
        <DetailBlock title="Cover note">
          <p className="rounded-2xl border border-border bg-white p-4 text-sm leading-relaxed">
            {app.coverNote}
          </p>
        </DetailBlock>
      )}

      {(app.resumeUrl || profile?.resumeUrl) && (
        <DetailBlock title="Resume">
          <a
            href={app.resumeUrl || profile?.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-primary hover:underline"
          >
            Open attached CV
          </a>
        </DetailBlock>
      )}

      <DetailBlock title="Timeline">
        <ol className="space-y-3">
          {app.timeline.map((step, i) => (
            <li key={`${step.at}-${i}`} className="flex gap-3 text-sm">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="font-medium">{statusLabel(step.status)}</p>
                <p className="text-xs text-ink-muted">{formatDateTime(step.at)}</p>
                {step.note && <p className="mt-1 text-ink-muted">{step.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </DetailBlock>
    </div>
  );
}
