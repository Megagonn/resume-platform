import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { packages, hirerPlans } from '../data/fixtures';
import { formatNaira } from '../lib/utils';
import { Button, PageHeader } from '../components/ui';

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader
        title="Pricing"
        subtitle="CV packages for seekers and hiring plans for companies."
      />

      <section className="mb-16">
        <h2 className="font-display text-2xl text-ink">CV packages</h2>
        <p className="mt-2 text-ink-muted">Order a rewrite — checkout is simulated in this demo.</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-3xl border bg-white p-8 transition hover:-translate-y-1 ${
                pkg.popular ? 'border-primary shadow-lift' : 'border-border hover:shadow-soft'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-xl font-bold">{pkg.name}</h3>
              <p className="mt-2 font-display text-3xl text-primary">{formatNaira(pkg.price)}</p>
              <p className="mt-2 text-sm text-ink-muted">{pkg.description}</p>
              <ul className="mt-6 space-y-3">
                {pkg.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={`/services/checkout/${pkg.slug}`} className="mt-8 block">
                <Button className="w-full" variant={pkg.popular ? 'primary' : 'outline'}>
                  Get started
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">For employers</h2>
        <p className="mt-2 text-ink-muted">
          Start free, upgrade for unlimited openings and full applicant access.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {hirerPlans.map((plan) => (
            <div key={plan.id} className="rounded-3xl border border-border bg-white p-8 transition hover:-translate-y-1 hover:shadow-soft">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="mt-2 font-display text-3xl text-primary">
                {plan.price === null
                  ? 'Custom'
                  : plan.price === 0
                    ? 'Free'
                    : `${formatNaira(plan.price)}/mo`}
              </p>
              <p className="mt-2 text-sm text-ink-muted">{plan.description}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.slug === 'custom' ? '/auth/signup' : '/auth/signup'}
                className="mt-8 block"
              >
                <Button className="w-full" variant="outline">
                  {plan.slug === 'custom' ? 'Contact sales' : 'Start hiring'}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
