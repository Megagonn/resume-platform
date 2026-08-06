import { useEffect, useState } from 'react';
import { mockApi } from '../../lib/mockApi';
import { formatDate, jobTypeLabel, statusLabel } from '../../lib/utils';
import type { Job } from '../../types';
import { Badge, PageHeader, Spinner, statusTone } from '../../components/ui';

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi
      .adminJobs()
      .then((res) => setJobs(res.jobs))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="All jobs" subtitle="Platform-wide openings." />
      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-surface-muted/50 text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Posted</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{j.title}</td>
                <td className="px-4 py-3">{j.company?.name}</td>
                <td className="px-4 py-3">{jobTypeLabel(j.type)}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(j.status)}>{statusLabel(j.status)}</Badge>
                </td>
                <td className="px-4 py-3 text-ink-muted">{formatDate(j.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
