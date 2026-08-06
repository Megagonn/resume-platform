import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../lib/mockApi';
import type { CompanySubscription } from '../../types';
import { Badge, Button, Input, PageHeader, Spinner, Textarea } from '../../components/ui';

export default function HirerCompany() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [subscription, setSubscription] = useState<CompanySubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    mockApi
      .getCompany(user.id)
      .then((res) => {
        setName(res.company.name);
        setWebsite(res.company.website || '');
        setLocation(res.company.location || '');
        setAbout(res.company.about || '');
        setSubscription(res.company.subscription);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      await mockApi.updateCompany(user.id, { name, website, location, about });
      setMessage('Company profile saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Company profile"
        subtitle="Shown on your job listings."
        actions={
          subscription ? (
            <Link to="/hirer/billing">
              <Badge tone="brand">{subscription.plan} plan</Badge>
            </Link>
          ) : undefined
        }
      />
      <form
        onSubmit={onSubmit}
        className="max-w-xl space-y-4 rounded-2xl border border-border bg-white p-6"
      >
        <Input label="Company name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
        <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Textarea label="About" value={about} onChange={(e) => setAbout(e.target.value)} />
        {message && <p className="text-sm text-primary">{message}</p>}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save company'}
          </Button>
          <Link to="/hirer/billing">
            <Button type="button" variant="outline">
              Manage plan
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
