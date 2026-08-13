import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(dashboardPath(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-10 px-4 py-12 lg:grid-cols-2">
      <div className="hidden lg:block">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">The Ready Brand</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-ink">
          Pick up where your career left off.
        </h1>
        <p className="mt-4 max-w-md text-ink-muted">
          Seekers, hirers, and admins share one workspace — CVs, jobs, and hiring in a single flow.
        </p>
      </div>
      <div className="rounded-3xl border border-border bg-white p-8 shadow-lift">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Welcome back</p>
        <h2 className="mt-2 font-display text-3xl text-ink">Log in</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Demo: ada@example.com / password · hiring@novatech.ng / password · admin@thereadybrand.com /
          Admin123!
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-muted">
          No account?{' '}
          <Link to="/auth/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
