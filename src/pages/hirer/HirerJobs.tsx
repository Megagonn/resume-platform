import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../lib/mockApi';
import { formatDate, jobTypeLabel, statusLabel } from '../../lib/utils';
import {
  Badge,
  Button,
  EmptyState,
  PageHeader,
  Spinner,
  statusTone,
} from '../../components/ui';
import type { Job } from '../../types';

export default function HirerJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user) return;
    setLoading(true);
    mockApi
      .listHirerJobs(user.id)
      .then((res) => setJobs(res.jobs))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const onDelete = async (id: string) => {
    if (!user || !confirm('Delete this opening?')) return;
    await mockApi.deleteJob(user.id, id);
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Your openings"
        subtitle="Draft, publish, and close roles."
        actions={
          <Link to="/hirer/jobs/new">
            <Button size="sm">New opening</Button>
          </Link>
        }
      />
      {jobs.length === 0 ? (
        <EmptyState title="No openings" description="Create your first job or gig." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-surface-muted/50 text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Posted</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {j.title}
                    {j.featured && (
                      <span className="ml-2 text-xs font-semibold text-primary">Featured</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{jobTypeLabel(j.type)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(j.status)}>{statusLabel(j.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(j.createdAt)}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link to={`/hirer/jobs/${j.id}`} className="text-primary font-medium">
                      Manage
                    </Link>
                    <button
                      type="button"
                      className="text-red-600 font-medium"
                      onClick={() => onDelete(j.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
