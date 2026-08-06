import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui';
import { cn } from '../../lib/utils';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'seeker' | 'hirer'>('seeker');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signup({
        email,
        password,
        name,
        role,
        phone: phone || undefined,
        companyName: role === 'hirer' ? companyName : undefined,
      });
      navigate(dashboardPath(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-border bg-white p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Get started</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Create your profile</h1>
        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-surface-muted p-1">
          <button
            type="button"
            onClick={() => setRole('seeker')}
            className={cn(
              'rounded-xl px-3 py-2.5 text-sm font-semibold transition',
              role === 'seeker' ? 'bg-white text-primary shadow-sm' : 'text-ink-muted'
            )}
          >
            Looking for a job
          </button>
          <button
            type="button"
            onClick={() => setRole('hirer')}
            className={cn(
              'rounded-xl px-3 py-2.5 text-sm font-semibold transition',
              role === 'hirer' ? 'bg-white text-primary shadow-sm' : 'text-ink-muted'
            )}
          >
            Hiring talent
          </button>
        </div>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {role === 'hirer' && (
            <Input
              label="Company name"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
