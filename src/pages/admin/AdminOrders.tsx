import { FormEvent, useEffect, useState } from 'react';
import { mockApi } from '../../lib/mockApi';
import { formatDate, formatNaira, statusLabel } from '../../lib/utils';
import type { Order, OrderStatus } from '../../types';
import {
  Badge,
  Button,
  Input,
  PageHeader,
  Select,
  Spinner,
  Textarea,
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
  const [deliveringId, setDeliveringId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [deliverables, setDeliverables] = useState('CV + cover letter');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => {
    setLoading(true);
    mockApi
      .adminOrders()
      .then((res) => setOrders(res.orders))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onStatus = async (id: string, status: OrderStatus) => {
    if (status === 'delivered') {
      setDeliveringId(id);
      setMessage('');
      setFile(null);
      const order = orders.find((o) => o.id === id);
      setDeliverables(order?.deliverables || 'CV + cover letter');
      setNotes(order?.notes || '');
      return;
    }
    await mockApi.adminUpdateOrder(id, { status });
    load();
  };

  const onDeliver = async (e: FormEvent) => {
    e.preventDefault();
    if (!deliveringId) return;
    setSaving(true);
    setMessage('');
    try {
      await mockApi.adminDeliverOrder(deliveringId, {
        file: file || undefined,
        deliverables,
        notes,
      });
      setMessage('Order delivered — seeker can download from their dashboard.');
      setDeliveringId(null);
      setFile(null);
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Delivery failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const delivering = orders.find((o) => o.id === deliveringId);

  return (
    <div>
      <PageHeader
        title="CV orders"
        subtitle="Update status and upload completed CVs for seekers to download."
      />

      {delivering && (
        <form
          onSubmit={onDeliver}
          className="mb-6 space-y-4 rounded-2xl border border-primary/30 bg-primary-50 p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-ink">Deliver order</h3>
              <p className="text-sm text-ink-muted">
                {delivering.package?.name} · {delivering.seeker?.name} ({delivering.seeker?.email})
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setDeliveringId(null)}>
              Cancel
            </Button>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink-muted">
              Completed CV file (PDF or Word){delivering.deliveryFileUrl ? ' — replace optional' : ' *'}
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required={!delivering.deliveryFileUrl}
            />
            {delivering.deliveryFileUrl && !file && (
              <p className="text-xs text-ink-muted">
                Current file: {delivering.deliveryFileName || 'attached'} — upload a new file to
                replace it.
              </p>
            )}
          </label>
          <Input
            label="What's included"
            value={deliverables}
            onChange={(e) => setDeliverables(e.target.value)}
            placeholder="CV + cover letter"
          />
          <Textarea
            label="Internal / client notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {message && <p className="text-sm text-primary">{message}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? 'Delivering…' : 'Mark delivered & publish file'}
          </Button>
        </form>
      )}

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm shadow-primary/5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {o.package?.name} · {formatNaira(o.amount)}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  {o.seeker?.name} ({o.seeker?.email}) · {formatDate(o.createdAt)}
                </p>
                {o.notes && <p className="mt-2 text-sm">Notes: {o.notes}</p>}
                {o.attachmentFileUrl && (
                  <p className="mt-2 text-sm">
                    Client attachment:{' '}
                    <a
                      href={o.attachmentFileUrl}
                      download={o.attachmentFileName || 'attachment'}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary underline"
                    >
                      {o.attachmentFileName || 'Download'}
                    </a>
                  </p>
                )}
                {o.deliveryFileUrl && (
                  <p className="mt-2 text-sm text-emerald-700">
                    File ready: {o.deliveryFileName || 'CV'}
                    {o.deliveredAt ? ` · ${formatDate(o.deliveredAt)}` : ''}
                  </p>
                )}
              </div>
              <Badge tone={statusTone(o.status)}>{statusLabel(o.status)}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="max-w-xs flex-1">
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
              {o.status !== 'cancelled' && (
                <Button
                  type="button"
                  size="sm"
                  variant={o.status === 'delivered' ? 'outline' : 'primary'}
                  onClick={() => onStatus(o.id, 'delivered')}
                >
                  {o.status === 'delivered' ? 'Re-deliver file' : 'Deliver CV'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
