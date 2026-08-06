import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import type { CvPackage } from '../types';
import { mockApi } from '../lib/mockApi';
import { formatNaira } from '../lib/utils';
import { Button, PageHeader, Spinner } from '../components/ui';

export default function ServicesPage() {
  const [packages, setPackages] = useState<CvPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi
      .listPackages()
      .then((res) => setPackages(res.packages))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader
        title="CV writing services"
        subtitle="Professional rewrite, LinkedIn polish, and cover letters — fulfilled by our writers."
      />
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-3xl border bg-white p-8 ${
                pkg.popular ? 'border-primary shadow-soft' : 'border-border'
              }`}
            >
              {pkg.popular && (
                <span className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                  Most popular
                </span>
              )}
              <h2 className="text-xl font-bold">{pkg.name}</h2>
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
      )}
      <p className="mt-10 text-center text-sm text-ink-muted">
        Prefer WhatsApp?{' '}
        <a
          href="https://wa.me/2347064641892"
          className="font-semibold text-primary hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Message us
        </a>
      </p>
    </div>
  );
}
