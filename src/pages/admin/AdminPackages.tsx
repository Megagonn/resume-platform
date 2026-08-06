import { FormEvent, useEffect, useState } from 'react';
import { mockApi } from '../../lib/mockApi';
import { formatNaira } from '../../lib/utils';
import type { CvPackage } from '../../types';
import {
  Badge,
  Button,
  Input,
  PageHeader,
  Spinner,
  Textarea,
} from '../../components/ui';

export default function AdminPackages() {
  const [packages, setPackages] = useState<CvPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    mockApi
      .listPackages(true)
      .then((res) => setPackages(res.packages))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

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

  const toggleActive = async (pkg: CvPackage) => {
    if (pkg.active) await mockApi.adminDeletePackage(pkg.id);
    else await mockApi.adminUpdatePackage(pkg.id, { active: true });
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="CV packages"
        subtitle="Catalog shown on the marketplace."
        actions={
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add package'}
          </Button>
        }
      />
      {showForm && (
        <form
          onSubmit={onCreate}
          className="mb-8 max-w-xl space-y-4 rounded-2xl border border-border bg-white p-6"
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
      <div className="space-y-3">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-5"
          >
            <div>
              <p className="font-semibold">
                {pkg.name}{' '}
                {!pkg.active && <Badge tone="danger">Inactive</Badge>}
                {pkg.popular && <Badge tone="brand">Popular</Badge>}
              </p>
              <p className="text-sm text-ink-muted">
                {formatNaira(pkg.price)} · {pkg.slug}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => toggleActive(pkg)}>
              {pkg.active ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
