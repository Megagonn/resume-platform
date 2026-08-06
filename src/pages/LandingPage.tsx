import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, FileText, Sparkles, Target, Users } from 'lucide-react';
import { Button } from '../components/ui';
import { packages, hirerPlans } from '../data/fixtures';
import { formatNaira } from '../lib/utils';

const features = [
  {
    icon: <Target className="h-6 w-6" />,
    title: 'ATS-Optimized CVs',
    desc: 'Crafted to pass applicant tracking systems and impress hiring managers.',
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Expert Writers',
    desc: 'Career specialists who understand Nigerian and global hiring markets.',
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: 'Fast Turnaround',
    desc: 'From 12 to 48 hours depending on your package — without cutting corners.',
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Cover Letters & LinkedIn',
    desc: 'Complete career kits that tell a coherent story across every channel.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Job Marketplace',
    desc: 'Browse openings from hirers who want Ready Brand talent.',
  },
  {
    icon: <CheckCircle2 className="h-6 w-6" />,
    title: 'Unlimited Revisions*',
    desc: 'On Standard and Premium — we iterate until it feels unmistakably you.',
  },
];

export default function LandingPage() {
  return (
    <div>
      <section className="relative isolate min-h-[88vh] overflow-hidden">
        <img
          src="/images/hero-career.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2a1520]/92 via-[#3d1e2e]/72 to-[#3d1e2e]/35" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 md:justify-center md:pb-24 md:pt-20">
          <div className="max-w-xl animate-fade-up">
            <p className="font-display text-5xl leading-[1.02] text-white sm:text-6xl md:text-7xl">
              The Ready Brand
            </p>
            <h1 className="mt-5 text-xl font-medium text-white/95 sm:text-2xl leading-snug">
              Career-ready CVs, and the jobs that deserve them.
            </h1>
            <p className="mt-4 max-w-md text-base text-white/75 leading-relaxed">
              Professional rewriting and a hiring marketplace — built for candidates and companies
              who want clarity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/services">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
                  Order a CV package <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/jobs">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                >
                  Browse jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl text-ink md:text-4xl">Why professionals choose us</h2>
          <p className="mt-3 text-ink-muted">
            From rewrite to role — a clearer path through the job market.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-white p-6 transition hover:-translate-y-1 hover:shadow-soft animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
                {f.icon}
              </div>
              <h3 className="mt-4 font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-y border-border">
        <img
          src="/images/section-workplace.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#2a1520]/78" />
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-white md:text-4xl">For employers</h2>
            <p className="mt-3 text-white/75">
              Post openings on Free, unlock unlimited roles and featured listings with Premium, or
              ask us for a Custom plan.
            </p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {hirerPlans.map((plan) => (
              <div key={plan.id} className="border-t border-white/25 pt-6">
                <h3 className="font-semibold text-white">{plan.name}</h3>
                <p className="mt-1 font-display text-2xl text-[#E8C4C8]">
                  {plan.price === null
                    ? 'Custom'
                    : plan.price === 0
                      ? 'Free'
                      : `${formatNaira(plan.price)}/mo`}
                </p>
                <p className="mt-2 text-sm text-white/70">{plan.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/auth/signup">
              <Button className="bg-white text-primary hover:bg-white/90">
                Hire on The Ready Brand <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="packages" className="bg-surface-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="font-display text-3xl text-ink md:text-4xl">CV packages</h2>
            <p className="mt-3 text-ink-muted">Pick a plan — checkout is simulated in this demo.</p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-3xl border bg-white p-8 ${
                  pkg.popular ? 'border-primary shadow-soft scale-[1.02]' : 'border-border'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-ink">{pkg.name}</h3>
                <p className="mt-2 font-display text-3xl text-primary">{formatNaira(pkg.price)}</p>
                <p className="mt-2 text-sm text-ink-muted">{pkg.description}</p>
                <ul className="mt-6 space-y-3">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-ink">
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
        </div>
      </section>

      <footer className="border-t border-border py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:justify-between">
          <div>
            <p className="font-display text-xl text-primary">The Ready Brand</p>
            <p className="mt-2 max-w-sm text-sm text-ink-muted">
              Professional CV writing and a job marketplace for candidates and hirers.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <Link to="/blog" className="text-ink-muted hover:text-primary">
              Blog
            </Link>
            <Link to="/pricing" className="text-ink-muted hover:text-primary">
              Pricing
            </Link>
            <Link to="/jobs" className="text-ink-muted hover:text-primary">
              Jobs
            </Link>
            <Link to="/services" className="text-ink-muted hover:text-primary">
              Services
            </Link>
            <a
              href="https://wa.me/2347064641892"
              target="_blank"
              rel="noreferrer"
              className="text-ink-muted hover:text-primary"
            >
              WhatsApp
            </a>
            <a href="mailto:hannah.cvwriter@gmail.com" className="text-ink-muted hover:text-primary">
              Email
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
