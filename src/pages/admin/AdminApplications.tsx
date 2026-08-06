import { useEffect, useState } from 'react';
import { mockApi } from '../../lib/mockApi';
import { formatDate, statusLabel } from '../../lib/utils';
import type { Application } from '../../types';
import { Badge, PageHeader, Spinner, statusTone } from '../../components/ui';

export default function AdminApplications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi
      .adminApplications()
      .then((res) => setApps(res.applications))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Applications" subtitle="All seeker applications." />
      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-surface-muted/50 text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Seeker</th>
              <th className="px-4 py-3 font-medium">Job</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{a.seeker?.name}</p>
                  <p className="text-xs text-ink-muted">{a.seeker?.email}</p>
                </td>
                <td className="px-4 py-3">{a.job?.title}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>
                </td>
                <td className="px-4 py-3 text-ink-muted">{formatDate(a.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
