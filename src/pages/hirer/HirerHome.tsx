import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../lib/mockApi';
import { statusLabel } from '../../lib/utils';
import { Briefcase, Sparkles, Star, XCircle } from 'lucide-react';
import { Badge, Button, Card, PageHeader, Spinner, StatCard, statusTone } from '../../components/ui';
import { ChartCard, SimpleBarChart, SimplePieChart } from '../../components/Charts';
import type { Job } from '../../types';

export default function HirerHome() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [openJobs, setOpenJobs] = useState(0);
  const [plan, setPlan] = useState('free');
  const [loading, setLoading] = useState(true);
  const [appCounts, setAppCounts] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([mockApi.listHirerJobs(user.id), mockApi.getSubscription(user.id)])
      .then(async ([jobsRes, sub]) => {
        setJobs(jobsRes.jobs);
        setOpenJobs(sub.usage.openJobs);
        setPlan(sub.subscription.plan);

        const openJobList = jobsRes.jobs.filter((j) => j.status === 'open').slice(0, 5);
        const appResults = await Promise.all(
          openJobList.map((j) => mockApi.listJobApplications(user.id, j.id))
        );
        setAppCounts(
          openJobList.map((j, i) => ({
            name: j.title.length > 18 ? `${j.title.slice(0, 16)}…` : j.title,
            value: appResults[i].totalCount,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [user]);

  const statusPie = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((j) => {
      counts[j.status] = (counts[j.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: statusLabel(name),
      value,
    }));
  }, [jobs]);

  if (loading) return <Spinner />;

  const open = jobs.filter((j) => j.status === 'open').length;
  const featured = jobs.filter((j) => j.featured).length;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name.split(' ')[0]}`}
        subtitle={`Hiring overview · ${plan} plan`}
        actions={
          <>
            <Link to="/hirer/billing">
              <Button variant="outline" size="sm">
                Billing
              </Button>
            </Link>
            <Link to="/hirer/jobs/new">
              <Button size="sm">Post opening</Button>
            </Link>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total openings" value={jobs.length} icon={<Briefcase size={18} />} />
        <StatCard
          label="Open now"
          value={open}
          hint={`${openJobs} counting toward plan`}
          icon={<Sparkles size={18} />}
        />
        <StatCard label="Featured" value={featured} icon={<Star size={18} />} />
        <StatCard
          label="Closed"
          value={jobs.filter((j) => j.status === 'closed').length}
          icon={<XCircle size={18} />}
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Openings by status">
          {statusPie.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-ink-muted">
              Post a job to see charts.
            </p>
          ) : (
            <SimplePieChart data={statusPie} />
          )}
        </ChartCard>
        <ChartCard title="Applicants per open role" subtitle="Top open listings">
          {appCounts.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-ink-muted">
              No open roles with applicants yet.
            </p>
          ) : (
            <SimpleBarChart data={appCounts} dataKey="value" />
          )}
        </ChartCard>
      </div>

      <Card>
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
                  {j.featured ? ' · Featured' : ''}
                </Link>
                <Badge tone={statusTone(j.status)}>{statusLabel(j.status)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
