import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../lib/mockApi';
import { formatNaira, statusLabel } from '../../lib/utils';
import { Briefcase, ClipboardList, Package } from 'lucide-react';
import { Badge, Button, Card, PageHeader, Spinner, StatCard, statusTone } from '../../components/ui';
import { ChartCard, SimpleAreaChart, SimplePieChart } from '../../components/Charts';
import type { Application, Order } from '../../types';

export default function SeekerHome() {
  const { user } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      mockApi.listSeekerApplications(user.id),
      mockApi.listSeekerOrders(user.id),
    ])
      .then(([a, o]) => {
        setApps(a.applications);
        setOrders(o.orders);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const appStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    apps.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: statusLabel(name), value }));
  }, [apps]);

  const trendData = useMemo(() => {
    const combined = [
      ...apps.map((a) => ({ at: a.createdAt, type: 'app' as const })),
      ...orders.map((o) => ({ at: o.createdAt, type: 'order' as const })),
    ].sort((a, b) => a.at.localeCompare(b.at));

    if (combined.length === 0) {
      return [
        { name: 'Week 1', activity: 0 },
        { name: 'Week 2', activity: 0 },
        { name: 'Week 3', activity: 0 },
        { name: 'Week 4', activity: 0 },
      ];
    }

    let running = 0;
    const buckets = ['W1', 'W2', 'W3', 'W4'];
    return buckets.map((name, i) => {
      const slice = combined.slice(
        Math.floor((i * combined.length) / 4),
        Math.floor(((i + 1) * combined.length) / 4)
      );
      running += slice.length;
      return { name, activity: running };
    });
  }, [apps, orders]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={`Hello, ${user?.name.split(' ')[0]}`}
        subtitle="Your applications, CV orders, and momentum at a glance."
        actions={
          <>
            <Link to="/jobs">
              <Button variant="outline" size="sm">
                Browse jobs
              </Button>
            </Link>
            <Link to="/services">
              <Button size="sm">Order CV package</Button>
            </Link>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Applications" value={apps.length} icon={<ClipboardList size={18} />} />
        <StatCard label="CV orders" value={orders.length} icon={<Package size={18} />} />
        <StatCard
          label="In progress"
          value={orders.filter((o) => ['paid', 'in_progress'].includes(o.status)).length}
          icon={<Briefcase size={18} />}
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Activity" subtitle="Applications & orders over recent weeks">
          <SimpleAreaChart data={trendData} dataKey="activity" />
        </ChartCard>
        <ChartCard title="Application pipeline" subtitle="Status mix">
          {appStatusData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-ink-muted">
              Apply to a job to see this chart.
            </p>
          ) : (
            <SimplePieChart data={appStatusData} />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent applications</h2>
            <Link to="/seeker/applications" className="text-sm text-primary">
              View all
            </Link>
          </div>
          {apps.length === 0 ? (
            <p className="text-sm text-ink-muted">No applications yet.</p>
          ) : (
            <ul className="space-y-3">
              {apps.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{a.job?.title}</span>
                  <Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">CV orders</h2>
            <Link to="/seeker/orders" className="text-sm text-primary">
              View all
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-ink-muted">No orders yet.</p>
          ) : (
            <ul className="space-y-3">
              {orders.slice(0, 4).map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>
                    {o.package?.name} · {formatNaira(o.amount)}
                  </span>
                  <div className="flex items-center gap-2">
                    {o.status === 'delivered' && o.deliveryFileUrl && (
                      <a
                        href={o.deliveryFileUrl}
                        download={o.deliveryFileName || 'ready-brand-cv.pdf'}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-primary underline"
                      >
                        Download
                      </a>
                    )}
                    <Badge tone={statusTone(o.status)}>{statusLabel(o.status)}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
