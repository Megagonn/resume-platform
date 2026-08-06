import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
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
        subtitle="Track rewrite progress and download completed files."
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
              {o.attachmentFileUrl && (
                <p className="mt-2 text-sm">
                  Your upload:{' '}
                  <a
                    href={o.attachmentFileUrl}
                    download={o.attachmentFileName || 'attachment'}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary underline"
                  >
                    {o.attachmentFileName || 'View attachment'}
                  </a>
                </p>
              )}
              {o.status === 'delivered' && o.deliveryFileUrl ? (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-emerald-900">Your CV is ready</p>
                    <p className="text-xs text-emerald-800/80">
                      {o.deliveryFileName || 'Completed package'}
                      {o.deliverables ? ` · ${o.deliverables}` : ''}
                      {o.deliveredAt ? ` · ${formatDate(o.deliveredAt)}` : ''}
                    </p>
                  </div>
                  <a
                    href={o.deliveryFileUrl}
                    download={o.deliveryFileName || 'ready-brand-cv.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                  >
                    <Download size={16} /> Download CV
                  </a>
                </div>
              ) : o.status === 'delivered' ? (
                <p className="mt-3 text-sm text-amber-800">
                  Marked delivered — file pending. Contact support if this persists.
                </p>
              ) : o.deliverables ? (
                <p className="mt-2 text-sm text-ink-muted">{o.deliverables}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
