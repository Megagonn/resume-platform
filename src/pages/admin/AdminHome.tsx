import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ClipboardList, CreditCard, FileText, Package, Users } from 'lucide-react';
import { mockApi } from '../../lib/mockApi';
import type { AdminStats } from '../../types';
import { PageHeader, Spinner, StatCard } from '../../components/ui';
import { ChartCard, SimpleBarChart, SimplePieChart } from '../../components/Charts';

export default function AdminHome() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    mockApi.adminStats().then((res) => setStats(res.stats));
  }, []);

  const planPie = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Free', value: stats.subscriptionsFree },
      { name: 'Premium', value: stats.subscriptionsPremium },
      { name: 'Custom', value: stats.subscriptionsCustom },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const funnel = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Users', value: stats.users },
      { name: 'Jobs', value: stats.jobs },
      { name: 'Apps', value: stats.applications },
      { name: 'Orders', value: stats.orders },
    ];
  }, [stats]);

  if (!stats) return <Spinner />;

  const cards = [
    { label: 'Seekers', value: stats.seekers, to: '/admin/users', icon: <Users size={18} /> },
    { label: 'Hirers', value: stats.hirers, to: '/admin/users', icon: <Users size={18} /> },
    { label: 'Open jobs', value: stats.openJobs, to: '/admin/jobs', icon: <Briefcase size={18} /> },
    {
      label: 'Applications',
      value: stats.applications,
      to: '/admin/applications',
      icon: <ClipboardList size={18} />,
    },
    {
      label: 'Active CV orders',
      value: stats.pendingOrders,
      to: '/admin/orders',
      icon: <Package size={18} />,
    },
    { label: 'Packages', value: stats.packages, to: '/admin/packages', icon: <FileText size={18} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Admin overview"
        subtitle="Platform health, hiring plans, and marketplace activity."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="block transition hover:-translate-y-0.5">
            <StatCard label={c.label} value={c.value} icon={c.icon} />
          </Link>
        ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Marketplace funnel" subtitle="Users → jobs → applications → CV orders">
          <SimpleBarChart data={funnel} dataKey="value" />
        </ChartCard>
        <ChartCard title="Employer subscriptions" subtitle="Companies by plan">
          {planPie.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-ink-muted">
              No companies yet.
            </p>
          ) : (
            <SimplePieChart data={planPie} />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/admin/subscriptions">
          <StatCard label="Free plans" value={stats.subscriptionsFree} icon={<CreditCard size={18} />} />
        </Link>
        <Link to="/admin/subscriptions">
          <StatCard
            label="Premium plans"
            value={stats.subscriptionsPremium}
            icon={<CreditCard size={18} />}
          />
        </Link>
        <Link to="/admin/subscriptions">
          <StatCard
            label="Custom plans"
            value={stats.subscriptionsCustom}
            icon={<CreditCard size={18} />}
          />
        </Link>
      </div>
    </div>
  );
}
