import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockApi } from '../../lib/mockApi';
import type { AdminStats } from '../../types';
import { PageHeader, Spinner } from '../../components/ui';

export default function AdminHome() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    mockApi.adminStats().then((res) => setStats(res.stats));
  }, []);

  if (!stats) return <Spinner />;

  const cards = [
    { label: 'Seekers', value: stats.seekers, to: '/admin/users' },
    { label: 'Hirers', value: stats.hirers, to: '/admin/users' },
    { label: 'Open jobs', value: stats.openJobs, to: '/admin/jobs' },
    { label: 'Applications', value: stats.applications, to: '/admin/applications' },
    { label: 'Active CV orders', value: stats.pendingOrders, to: '/admin/orders' },
    { label: 'Packages', value: stats.packages, to: '/admin/packages' },
    { label: 'Free plans', value: stats.subscriptionsFree, to: '/admin/subscriptions' },
    { label: 'Premium plans', value: stats.subscriptionsPremium, to: '/admin/subscriptions' },
    { label: 'Custom plans', value: stats.subscriptionsCustom, to: '/admin/subscriptions' },
  ];

  return (
    <div>
      <PageHeader
        title="Admin overview"
        subtitle="The Ready Brand platform health."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="rounded-2xl border border-border bg-white p-6 transition hover:border-primary/30 hover:shadow-soft"
          >
            <p className="text-sm text-ink-muted">{c.label}</p>
            <p className="mt-2 font-display text-4xl text-primary">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
