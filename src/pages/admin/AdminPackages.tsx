import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { mockApi } from '../../lib/mockApi';
import { formatDate, formatNaira, statusLabel } from '../../lib/utils';
import type { AdminPackageRow, Order } from '../../types';
import {
  Badge,
  Button,
  DetailBlock,
  Drawer,
  Input,
  MiniStat,
  PageHeader,
  Spinner,
  Textarea,
  statusTone,
} from '../../components/ui';

type PackageDetail = {
  package: AdminPackageRow;
  orders: Order[];
  stats: AdminPackageRow['stats'];
};

export default function AdminPackages() {
  const [packages, setPackages] = useState<AdminPackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PackageDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = () => {
    setLoading(true);
    mockApi
      .adminPackages()
      .then((res) => setPackages(res.packages as AdminPackageRow[]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    mockApi
      .adminPackageDetail(selectedId)
      .then((res) => setDetail(res as PackageDetail))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await mockApi.adminCreatePackage({
        name,
        slug,
        price: Number(price),
        currency: 'NGN',
        description,
        features: features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        popular: false,
        active: true,
      });
      setShowForm(false);
      setName('');
      setSlug('');
      setPrice('');
      setDescription('');
      setFeatures('');
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (pkg: AdminPackageRow) => {
    if (pkg.active) await mockApi.adminDeletePackage(pkg.id);
    else await mockApi.adminUpdatePackage(pkg.id, { active: true });
    load();
    if (selectedId === pkg.id) {
      mockApi.adminPackageDetail(pkg.id).then((res) => setDetail(res as PackageDetail));
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="CV packages"
        subtitle="Catalog performance, orders, and what each package includes."
        actions={
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add package'}
          </Button>
        }
      />
      {showForm && (
        <form
          onSubmit={onCreate}
          className="mb-8 max-w-xl space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm"
        >
          <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Input
            label="Price (NGN)"
            type="number"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Input
            label="Description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Textarea
            label="Features (one per line)"
            required
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
          />
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating…' : 'Create package'}
          </Button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {packages.map((pkg) => (
          <button
            key={pkg.id}
            type="button"
            onClick={() => setSelectedId(pkg.id)}
            className="rounded-2xl border border-border bg-white p-6 text-left shadow-sm shadow-primary/5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{pkg.name}</p>
                <p className="mt-1 font-display text-2xl text-primary">{formatNaira(pkg.price)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {!pkg.active && <Badge tone="danger">Inactive</Badge>}
                {pkg.popular && <Badge tone="brand">Popular</Badge>}
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{pkg.description}</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <MiniStat label="Orders" value={pkg.stats.orders} />
              <MiniStat label="Active" value={pkg.stats.pending} />
              <MiniStat label="Done" value={pkg.stats.delivered} />
            </div>
            <p className="mt-4 text-xs text-ink-muted">
              Revenue {formatNaira(pkg.stats.revenue)} · {pkg.features.length} features
            </p>
          </button>
        ))}
      </div>

      <Drawer
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title={detail?.package.name || 'Package'}
        subtitle={detail ? formatNaira(detail.package.price) : undefined}
        wide
      >
        {detailLoading || !detail ? (
          <Spinner />
        ) : (
          <PackageDetailBody
            detail={detail}
            onToggle={() => toggleActive(detail.package as AdminPackageRow)}
          />
        )}
      </Drawer>
    </div>
  );
}

function PackageDetailBody({
  detail,
  onToggle,
}: {
  detail: PackageDetail;
  onToggle: () => void;
}) {
  const { package: pkg, orders, stats } = detail;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        {pkg.popular && <Badge tone="brand">Most popular</Badge>}
        <Badge tone={pkg.active ? 'success' : 'danger'}>{pkg.active ? 'Active' : 'Inactive'}</Badge>
        <Badge>{pkg.slug}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniStat label="Orders" value={stats.orders} />
        <MiniStat label="In progress" value={stats.pending} />
        <MiniStat label="Delivered" value={stats.delivered} />
        <MiniStat label="Revenue" value={formatNaira(stats.revenue)} />
      </div>

      <DetailBlock title="Description">
        <p className="text-sm leading-relaxed text-ink">{pkg.description}</p>
      </DetailBlock>

      <DetailBlock title="What's included">
        <ul className="space-y-2">
          {pkg.features.map((f) => (
            <li key={f} className="flex gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>
      </DetailBlock>

      <DetailBlock title="Orders">
        {orders.length === 0 ? (
          <p className="text-sm text-ink-muted">No orders for this package yet.</p>
        ) : (
          <ul className="space-y-2">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium">{o.seeker?.name}</p>
                  <p className="text-xs text-ink-muted">
                    {formatNaira(o.amount)} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <Badge tone={statusTone(o.status)}>{statusLabel(o.status)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </DetailBlock>

      <Button size="sm" variant="outline" onClick={onToggle}>
        {pkg.active ? 'Deactivate package' : 'Activate package'}
      </Button>
    </div>
  );
}
