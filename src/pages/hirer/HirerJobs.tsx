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
  TableShell,
  Td,
  Th,
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
        <TableShell minWidth="min-w-[640px]">
          <thead className="border-b border-border bg-surface-muted/50 text-ink-muted">
            <tr>
              <Th>Title</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Posted</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-b border-border last:border-0 hover:bg-primary-50/40">
                <Td className="font-medium">
                  {j.title}
                  {j.featured && (
                    <span className="ml-2 text-xs font-semibold text-primary">Featured</span>
                  )}
                </Td>
                <Td>{jobTypeLabel(j.type)}</Td>
                <Td>
                  <Badge tone={statusTone(j.status)}>{statusLabel(j.status)}</Badge>
                </Td>
                <Td className="text-ink-muted">{formatDate(j.createdAt)}</Td>
                <Td className="text-right space-x-2">
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
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
