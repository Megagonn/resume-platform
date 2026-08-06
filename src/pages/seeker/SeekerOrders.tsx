import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../lib/mockApi';
import { formatDate, formatNaira, statusLabel } from '../../lib/utils';
import {
  Badge,
  Button,
  EmptyState,
  PageHeader,
  Spinner,
  statusTone,
} from '../../components/ui';
import type { Order } from '../../types';

export default function SeekerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    mockApi
      .listSeekerOrders(user.id)
      .then((res) => setOrders(res.orders))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="CV service orders"
        subtitle="Track rewrite and package fulfillment."
        actions={
          <Link to="/services">
            <Button size="sm">New order</Button>
          </Link>
        }
      />
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Choose a CV package to get started." />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{o.package?.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {formatNaira(o.amount)} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <Badge tone={statusTone(o.status)}>{statusLabel(o.status)}</Badge>
              </div>
              {o.notes && <p className="mt-3 text-sm text-ink-muted">Notes: {o.notes}</p>}
              {o.deliverables && (
                <p className="mt-2 text-sm text-emerald-700">Deliverables: {o.deliverables}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
