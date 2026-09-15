import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { CvPackage } from '../types';
import { mockApi } from '../lib/mockApi';
import { formatNaira } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotificationContext';
import { getErrorMessage } from '../lib/errors';
import { Button, Input, Spinner, Textarea } from '../components/ui';

export default function CheckoutPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const { user } = useAuth();
  const { notifyError } = useNotify();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<CvPackage | null>(null);
  const [notes, setNotes] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

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
      notifyError('Only job seekers can order CV packages in this demo.');
      return;
    }
    setSubmitting(true);
    try {
      await mockApi.createOrder(user.id, pkg!.id, {
        notes,
        markPaid: true,
        file: attachment || undefined,
      });
      setDone(true);
    } catch (err) {
      notifyError(getErrorMessage(err, 'Checkout failed'));
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
            dashboard
            {attachment ? ', including your uploaded attachment for the writer.' : '.'}
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
        className="mt-6 space-y-5 rounded-3xl border border-border bg-white p-8 shadow-soft"
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
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink-muted">
            Attachment (optional)
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
          />
          <p className="text-xs text-ink-muted">
            Upload your current CV or a brief (PDF / Word). Writers will use this as a starting
            point.
          </p>
          {attachment && (
            <p className="text-sm text-primary">Selected: {attachment.name}</p>
          )}
        </label>
        <Input
          label="Card number (demo)"
          placeholder="4242 4242 4242 4242"
          defaultValue="4242 4242 4242 4242"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Expiry" placeholder="12/28" defaultValue="12/28" />
          <Input label="CVC" placeholder="123" defaultValue="123" />
        </div>
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
