import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../lib/mockApi';
import { formatNaira, statusLabel } from '../../lib/utils';
import { Badge, Button, PageHeader, Spinner, statusTone } from '../../components/ui';
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
        setApps(a.applications.slice(0, 3));
        setOrders(o.orders.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={`Hello, ${user?.name.split(' ')[0]}`}
        subtitle="Track applications and CV service orders."
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
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-white p-6">
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
              {apps.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{a.job?.title}</span>
                  <Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-border bg-white p-6">
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
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>
                    {o.package?.name} · {formatNaira(o.amount)}
                  </span>
                  <Badge tone={statusTone(o.status)}>{statusLabel(o.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
