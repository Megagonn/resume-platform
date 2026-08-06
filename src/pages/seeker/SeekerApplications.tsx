import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../lib/mockApi';
import { formatDate, statusLabel } from '../../lib/utils';
import {
  Badge,
  EmptyState,
  PageHeader,
  Spinner,
  statusTone,
} from '../../components/ui';
import type { Application } from '../../types';

export default function SeekerApplications() {
  const { user } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    mockApi
      .listSeekerApplications(user.id)
      .then((res) => setApps(res.applications))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="My applications" subtitle="Status updates from hirers." />
      {apps.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Browse open roles and apply with a cover note."
        />
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    to={`/jobs/${a.jobId}`}
                    className="font-semibold text-ink hover:text-primary"
                  >
                    {a.job?.title}
                  </Link>
                  <p className="mt-1 text-sm text-ink-muted">
                    {a.job?.company?.name} · Applied {formatDate(a.createdAt)}
                  </p>
                </div>
                <Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>
              </div>
              {a.coverNote && (
                <p className="mt-3 text-sm text-ink-muted line-clamp-2">{a.coverNote}</p>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-6">
        <Link to="/jobs" className="text-sm font-semibold text-primary hover:underline">
          Find more jobs →
        </Link>
      </div>
    </div>
  );
}
