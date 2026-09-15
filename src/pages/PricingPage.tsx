import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import type { CvPackage, HirerPlan } from '../types';
import { mockApi } from '../lib/mockApi';
import { formatNaira } from '../lib/utils';
import { Button, PageHeader, Spinner } from '../components/ui';
import { usePageMeta } from '../hooks/usePageMeta';

export default function PricingPage() {
  const [packages, setPackages] = useState<CvPackage[]>([]);
  const [hirerPlans, setHirerPlans] = useState<HirerPlan[]>([]);
  const [loading, setLoading] = useState(true);

  usePageMeta(
    'Pricing | CV Packages & Hiring Plans',
    'Transparent pricing for CV writing packages and employer hiring plans on The Ready Brand.'
  );

  useEffect(() => {
    Promise.all([mockApi.listPackages(), mockApi.listHirerPlans()])
      .then(([pkgRes, planRes]) => {
        setPackages(pkgRes.packages);
        setHirerPlans(planRes.plans);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader
        title="Pricing"
        subtitle="CV packages for seekers and hiring plans for companies."
      />

      {loading ? (
        <Spinner />
      ) : (
        <>
          <section className="mb-16">
            <h2 className="font-display text-2xl text-ink">CV packages</h2>
            <p className="mt-2 text-ink-muted">Professional rewrites with clear deliverables and turnaround times.</p>
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
                      Order package
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Hiring plans</h2>
            <p className="mt-2 text-ink-muted">Post jobs and reach career-ready candidates across Nigeria.</p>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {hirerPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-3xl border bg-white p-8 transition hover:-translate-y-1 ${
                    plan.slug === 'premium' ? 'border-primary shadow-lift' : 'border-border hover:shadow-soft'
                  }`}
                >
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-2 font-display text-3xl text-primary">
                    {plan.price === null
                      ? 'Custom'
                      : plan.price === 0
                        ? 'Free'
                        : `${formatNaira(plan.price)}/month`}
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
                    to={plan.slug === 'custom' ? '/auth/signup?role=hirer' : '/auth/signup?role=hirer'}
                    className="mt-8 block"
                  >
                    <Button className="w-full" variant={plan.slug === 'premium' ? 'primary' : 'outline'}>
                      {plan.slug === 'custom' ? 'Contact sales' : 'Get started'}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
