import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../lib/mockApi';
import { statusLabel } from '../../lib/utils';
import { Badge, Button, PageHeader, Spinner, statusTone } from '../../components/ui';
import type { Job } from '../../types';

export default function HirerHome() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    mockApi
      .listHirerJobs(user.id)
      .then((res) => setJobs(res.jobs))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Spinner />;

  const open = jobs.filter((j) => j.status === 'open').length;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name.split(' ')[0]}`}
        subtitle="Manage openings and review applicants."
        actions={
          <Link to="/hirer/jobs/new">
            <Button size="sm">Post opening</Button>
          </Link>
        }
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total openings', value: jobs.length },
          { label: 'Open now', value: open },
          { label: 'Closed', value: jobs.length - open },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-white p-5">
            <p className="text-sm text-ink-muted">{s.label}</p>
            <p className="mt-1 font-display text-3xl text-primary">{s.value}</p>
          </div>
        ))}
      </div>
      <section className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-4 flex justify-between">
          <h2 className="font-semibold">Latest openings</h2>
          <Link to="/hirer/jobs" className="text-sm text-primary">
            Manage all
          </Link>
        </div>
        {jobs.length === 0 ? (
          <p className="text-sm text-ink-muted">No openings yet. Post your first role.</p>
        ) : (
          <ul className="space-y-3">
            {jobs.slice(0, 5).map((j) => (
              <li key={j.id} className="flex items-center justify-between gap-2 text-sm">
                <Link to={`/hirer/jobs/${j.id}`} className="font-medium hover:text-primary">
                  {j.title}
                </Link>
                <Badge tone={statusTone(j.status)}>{statusLabel(j.status)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
