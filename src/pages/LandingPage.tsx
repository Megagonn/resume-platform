import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, FileText, Sparkles, Target, Users } from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/ui';
import { mockApi } from '../lib/mockApi';
import { formatNaira } from '../lib/utils';
import type { CvPackage, HirerPlan } from '../types';

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
  const [packages, setPackages] = useState<CvPackage[]>([]);
  const [hirerPlans, setHirerPlans] = useState<HirerPlan[]>([]);

  useEffect(() => {
    Promise.all([mockApi.listPackages(), mockApi.listHirerPlans()]).then(([pkgRes, planRes]) => {
      setPackages(pkgRes.packages);
      setHirerPlans(planRes.plans);
    });
  }, []);

  return (
    <div>
      <section className="relative isolate min-h-[88vh] overflow-hidden">
        <img
          src="/images/hero-career.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[72%_center] animate-fade-in md:object-[78%_center]"
        />
        {/* Full vignette + strong left scrim so copy stays readable */}
        <div className="absolute inset-0 bg-[#1a0f14]/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0f14] via-[#1a0f14]/92 to-transparent md:w-[68%]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#1a0f14]/80 to-transparent md:hidden" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 md:justify-center md:pb-24 md:pt-20">
          <div className="max-w-2xl animate-fade-up">
            <BrandMark variant="hero" link={false} />
            <h1 className="mt-3 font-display text-3xl leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-4xl md:text-5xl">
              Professional CV Writing &amp; Career Services That Help You Get Noticed
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium text-white/90 leading-relaxed sm:text-lg">
              Get an ATS-friendly CV, LinkedIn profile, cover letter and career support designed to
              help you present your experience clearly and compete for better opportunities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-[#5D2E46] shadow-lg transition hover:bg-white/95"
              >
                Get Your CV Reviewed <ArrowRight size={18} />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/80 bg-black/20 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Explore Career Services
              </Link>
            </div>
            <p className="mt-6 text-sm font-medium text-white/75">
              CV writing &bull; LinkedIn optimization &bull; Cover letters &bull; Career coaching
              &bull; Job opportunities
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl text-ink md:text-3xl">
              Your experience is valuable. Let&apos;s make sure your application shows it.
            </h2>
            <p className="mt-4 text-ink-muted leading-relaxed">
              We help graduates and professionals turn their experience, skills and achievements into
              stronger career documents and professional profiles that are easier for recruiters to
              understand.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl text-ink md:text-3xl">
              Built for ATS. Written for humans.
            </h2>
            <p className="mt-4 text-ink-muted leading-relaxed">
              Your CV has to pass two tests: it needs to be readable by applicant tracking systems
              and compelling enough for a recruiter to keep reading.
            </p>
            <p className="mt-3 text-ink-muted leading-relaxed">
              We build your CV around the role you&apos;re targeting, using relevant keywords, clear
              structure and achievement-focused language.
            </p>
            <Link to="/services" className="mt-8 inline-block">
              <Button>Build My CV</Button>
            </Link>
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
              className="rounded-2xl border border-border bg-white p-6 transition hover:-translate-y-1 hover:border-primary/20 hover:shadow-lift animate-fade-up"
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
          className="absolute inset-0 h-full w-full object-cover object-[60%_center] md:object-[68%_center]"
        />
        {/* Match main hero: full vignette + left scrim for readable copy */}
        <div className="absolute inset-0 bg-[#1a0f14]/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0f14] via-[#1a0f14]/90 to-[#1a0f14]/45" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#1a0f14]/70 to-transparent md:hidden" />
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] md:text-4xl">
              You have a role to fill. Let the right candidates find it.
            </h2>
            <p className="mt-3 font-medium text-white/95 drop-shadow-sm">
              Post your vacancy and connect with graduates and professionals actively looking for
              their next opportunity.
            </p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {hirerPlans.map((plan) => (
              <div key={plan.id} className="border-t border-white/40 pt-6">
                <h3 className="font-semibold text-white drop-shadow-sm">{plan.name}</h3>
                <p className="mt-1 font-display text-2xl text-[#F3D6DB] drop-shadow-sm">
                  {plan.price === null
                    ? 'Custom'
                    : plan.price === 0
                      ? 'Free'
                      : `${formatNaira(plan.price)}/month`}
                </p>
                <p className="mt-2 text-sm font-medium text-white/90">{plan.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link
              to="/auth/signup?role=hirer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#5D2E46] shadow-lg transition hover:bg-white/95"
            >
              Post a Job <ArrowRight size={16} />
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
                className={`relative rounded-3xl border bg-white p-8 transition hover:-translate-y-1 ${
                  pkg.popular ? 'border-primary shadow-lift scale-[1.02]' : 'border-border hover:shadow-soft'
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

    </div>
  );
}
