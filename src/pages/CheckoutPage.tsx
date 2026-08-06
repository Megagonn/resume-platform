import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { CvPackage } from '../types';
import { mockApi } from '../lib/mockApi';
import { formatNaira } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Spinner, Textarea } from '../components/ui';

export default function CheckoutPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<CvPackage | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!packageId) return;
    mockApi
      .getPackage(packageId)
      .then((res) => setPkg(res.package))
      .catch(() => setPkg(null))
      .finally(() => setLoading(false));
  }, [packageId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (user.role !== 'seeker') {
      setError('Only job seekers can order CV packages in this demo.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await mockApi.createOrder(user.id, pkg!.id, notes, true);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (!pkg) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-display text-2xl">Package not found</p>
        <Link to="/services" className="mt-4 inline-block text-primary">
          Back to services
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center animate-fade-in">
        <div className="rounded-3xl border border-border bg-white p-10 shadow-soft">
          <p className="font-display text-3xl text-primary">Order placed</p>
          <p className="mt-3 text-ink-muted">
            Payment is simulated. Your {pkg.name} order is marked paid and will appear in your
            dashboard.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/seeker/orders">
              <Button>View my orders</Button>
            </Link>
            <Link to="/services">
              <Button variant="outline">More packages</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 animate-fade-in">
      <Link to="/services" className="text-sm font-medium text-primary hover:underline">
        ← Packages
      </Link>
      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-3xl border border-border bg-white p-8 shadow-soft space-y-5"
      >
        <h1 className="font-display text-3xl text-ink">Checkout</h1>
        <div className="rounded-2xl bg-surface-muted p-4">
          <p className="font-semibold">{pkg.name}</p>
          <p className="mt-1 font-display text-2xl text-primary">{formatNaira(pkg.price)}</p>
          <p className="mt-1 text-sm text-ink-muted">{pkg.description}</p>
        </div>
        <Textarea
          label="Notes for your writer (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Target role, tone, achievements to highlight…"
        />
        <Input label="Card number (demo)" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Expiry" placeholder="12/28" defaultValue="12/28" />
          <Input label="CVC" placeholder="123" defaultValue="123" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Processing…' : `Pay ${formatNaira(pkg.price)} (mock)`}
        </Button>
        <p className="text-center text-xs text-ink-muted">
          Demo checkout only — no real charge. Live payments can later use Sella.
        </p>
      </form>
    </div>
  );
}
