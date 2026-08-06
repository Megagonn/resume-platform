import { useEffect, useState } from 'react';
import { mockApi } from '../../lib/mockApi';
import { formatDate, formatNaira, statusLabel } from '../../lib/utils';
import type { Order, OrderStatus } from '../../types';
import {
  Badge,
  PageHeader,
  Select,
  Spinner,
  statusTone,
} from '../../components/ui';

const statuses: OrderStatus[] = [
  'pending',
  'paid',
  'in_progress',
  'delivered',
  'cancelled',
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    mockApi
      .adminOrders()
      .then((res) => setOrders(res.orders))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onStatus = async (id: string, status: OrderStatus) => {
    const deliverables =
      status === 'delivered' ? 'Deliverables sent to client email' : undefined;
    await mockApi.adminUpdateOrder(id, { status, deliverables });
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="CV orders" subtitle="Fulfillment queue for writers." />
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {o.package?.name} · {formatNaira(o.amount)}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  {o.seeker?.name} ({o.seeker?.email}) · {formatDate(o.createdAt)}
                </p>
                {o.notes && <p className="mt-2 text-sm">Notes: {o.notes}</p>}
              </div>
              <Badge tone={statusTone(o.status)}>{statusLabel(o.status)}</Badge>
            </div>
            <div className="mt-4 max-w-xs">
              <Select
                label="Update status"
                value={o.status}
                onChange={(e) => onStatus(o.id, e.target.value as OrderStatus)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
