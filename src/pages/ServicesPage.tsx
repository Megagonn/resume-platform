import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { CvPackage, ServicePage } from '../types';
import { mockApi } from '../lib/mockApi';
import { formatNaira } from '../lib/utils';
import { Button, PageHeader, Spinner } from '../components/ui';
import { usePageMeta } from '../hooks/usePageMeta';
import { servicePageLabels } from '../data/servicePages';

export default function ServicesPage() {
  const [packages, setPackages] = useState<CvPackage[]>([]);
  const [servicePages, setServicePages] = useState<ServicePage[]>([]);
  const [loading, setLoading] = useState(true);

  usePageMeta(
    'CV & Career Writing Services | The Ready Brand',
    'Professional CV writing, resume services, LinkedIn optimization, cover letters, academic writing, and career coaching in Nigeria. Choose a specialist service or order a package.'
  );

  useEffect(() => {
    Promise.all([mockApi.listPackages(), mockApi.listServicePages()])
      .then(([pkgRes, pagesRes]) => {
        setPackages(pkgRes.packages);
        setServicePages(pagesRes.pages);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <PageHeader
          title="CV & career writing services"
          subtitle="Specialist landing pages for every service — each optimized for search and built to convert. Pick a service below or order a package."
        />

        {loading ? (
          <Spinner />
        ) : (
          <>
            <section className="mt-10">
              <h2 className="font-display text-2xl text-ink">Our services</h2>
              <p className="mt-2 max-w-2xl text-ink-muted">
                Google ranks specific pages, not generic ones. Explore dedicated pages for each
                service with tailored FAQs, examples, and testimonials.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {servicePages.map((page) => (
                  <Link
                    key={page.slug}
                    to={`/${page.slug}`}
                    className="group rounded-2xl border border-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                      {page.eyebrow}
                    </p>
                    <h3 className="mt-2 font-semibold text-ink group-hover:text-primary">
                      {servicePageLabels[page.slug] ?? page.headline}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{page.subheadline}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Learn more <ArrowRight size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-16 border-t border-border pt-16">
              <h2 className="font-display text-2xl text-ink">CV packages</h2>
              <p className="mt-2 text-ink-muted">
                Bundled options when you need a full CV rewrite plus extras.
              </p>
              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`rounded-3xl border bg-white p-8 transition hover:-translate-y-1 ${
                      pkg.popular ? 'border-primary shadow-lift' : 'border-border hover:shadow-soft'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
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
          </>
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
    </div>
  );
}
