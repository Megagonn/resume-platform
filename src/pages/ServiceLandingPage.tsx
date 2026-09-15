import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageCircle,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import type { CvPackage, ServicePage } from '../types';
import { SERVICE_PAGE_SLUGS } from '../types';
import { mockApi } from '../lib/mockApi';
import { formatNaira } from '../lib/utils';
import { Button, Spinner } from '../components/ui';
import { usePageMeta } from '../hooks/usePageMeta';
import { FaqSection } from '../components/FaqSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { ServiceExamplesSection } from '../components/ServiceExamplesSection';

const benefitIcons = [Target, Zap, Sparkles, FileText];

export default function ServiceLandingPage() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, '');
  const [page, setPage] = useState<ServicePage | null>(null);
  const [recommendedPackage, setRecommendedPackage] = useState<CvPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  usePageMeta(page?.metaTitle ?? 'Career Services | The Ready Brand', page?.metaDescription);

  useEffect(() => {
    if (!slug || !SERVICE_PAGE_SLUGS.includes(slug as (typeof SERVICE_PAGE_SLUGS)[number])) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);

    Promise.all([mockApi.getServicePage(slug), mockApi.listPackages()])
      .then(([pageRes, packagesRes]) => {
        setPage(pageRes.page);
        const pkg = packagesRes.packages.find((p) => p.slug === pageRes.page.recommendedPackageSlug);
        setRecommendedPackage(pkg ?? null);
      })
      .catch(() => {
        setPage(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Spinner />;
  if (notFound || !page) return <Navigate to="/services" replace />;

  return (
    <div>
      <section className="border-b border-border bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">{page.eyebrow}</p>
            <h1 className="mt-3 font-display text-3xl text-ink md:text-4xl lg:text-5xl">{page.headline}</h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">{page.subheadline}</p>
            {page.keywords.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {page.keywords.slice(0, 5).map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={page.primaryCtaHref}>
                <Button size="lg" className="gap-2">
                  {page.primaryCtaLabel} <ArrowRight size={18} />
                </Button>
              </Link>
              <a href="https://wa.me/2347064641892" target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="gap-2">
                  <MessageCircle size={18} /> WhatsApp us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-xl">
          <h2 className="font-display text-2xl text-ink md:text-3xl">What you get</h2>
          <p className="mt-3 text-ink-muted">Focused deliverables designed for this service.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {page.benefits.map((benefit, index) => {
            const Icon = benefitIcons[index % benefitIcons.length];
            return (
              <div key={benefit.title} className="rounded-2xl border border-border bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-ink">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {page.processSteps.length > 0 && (
        <section className="border-y border-border bg-surface-muted/40 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl text-ink md:text-3xl">How it works</h2>
              <p className="mt-3 text-ink-muted">A simple process from first contact to finished work.</p>
            </div>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {page.processSteps.map((step, index) => (
                <li key={step.title} className="rounded-2xl border border-border bg-white p-6">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <ServiceExamplesSection examples={page.examples} />

      <TestimonialsSection testimonials={page.testimonials} />

      <FaqSection faqs={page.faqs} />

      {recommendedPackage && (
        <section className="border-y border-border bg-surface-muted/40 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl text-ink md:text-3xl">Recommended package</h2>
              <p className="mt-3 text-ink-muted">
                The best-fit option for {page.eyebrow.toLowerCase()} — order online in minutes.
              </p>
            </div>
            <div className="mt-10 max-w-md">
              <div
                className={`rounded-3xl border bg-white p-8 ${
                  recommendedPackage.popular ? 'border-primary shadow-lift' : 'border-border'
                }`}
              >
                {recommendedPackage.popular && (
                  <span className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-ink">{recommendedPackage.name}</h3>
                <p className="mt-2 font-display text-3xl text-primary">
                  {formatNaira(recommendedPackage.price)}
                </p>
                <p className="mt-2 text-sm text-ink-muted">{recommendedPackage.description}</p>
                <ul className="mt-6 space-y-3">
                  {recommendedPackage.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-ink">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={`/services/checkout/${recommendedPackage.slug}`} className="mt-8 block">
                  <Button className="w-full">{page.primaryCtaLabel}</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl border border-border bg-white px-8 py-12 text-center md:px-16">
          <h2 className="font-display text-2xl text-ink md:text-3xl">Ready to get started?</h2>
          <p className="mx-auto mt-3 max-w-lg text-ink-muted">
            Order online or message us on WhatsApp — we will confirm your brief and delivery timeline.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to={page.primaryCtaHref}>
              <Button size="lg" className="gap-2">
                {page.primaryCtaLabel} <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline">
                View all services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
