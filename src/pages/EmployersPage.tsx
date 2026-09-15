import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Users, Zap, Eye } from 'lucide-react';
import { mockApi } from '../lib/mockApi';
import { formatNaira } from '../lib/utils';
import type { HirerPlan } from '../types';
import { Button } from '../components/ui';
import { usePageMeta } from '../hooks/usePageMeta';
import { useAuth } from '../context/AuthContext';

const benefits = [
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Reach active job seekers',
    desc: 'Your listing appears alongside CV-ready graduates and professionals who are actively looking for their next role.',
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: 'Review applicants in one place',
    desc: 'See who applied, read cover notes, and access resumes without juggling email threads or spreadsheets.',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Upgrade when you need more reach',
    desc: 'Start free with one opening, then unlock unlimited postings, featured placement, and full applicant access.',
  },
];

export default function EmployersPage() {
  const { user } = useAuth();
  const [hirerPlans, setHirerPlans] = useState<HirerPlan[]>([]);
  const postJobTo =
    user?.role === 'hirer' ? '/hirer/jobs/new' : '/auth/signup?role=hirer';

  useEffect(() => {
    mockApi.listHirerPlans().then((res) => setHirerPlans(res.plans));
  }, []);

  usePageMeta(
    'Post Jobs in Nigeria | Hire Qualified Candidates',
    'Post job vacancies in Nigeria and connect with qualified graduates and professionals. Start free or upgrade for unlimited postings, featured listings, and full applicant access.'
  );

  return (
    <div>
      <section className="border-b border-border bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">For employers</p>
            <h1 className="mt-3 font-display text-3xl text-ink md:text-4xl lg:text-5xl">
              You have a role to fill. Let the right candidates find it.
            </h1>
            <p className="mt-5 text-lg text-ink-muted leading-relaxed">
              Post your vacancy and connect with graduates and professionals actively looking for
              their next opportunity.
            </p>
            <div className="mt-8">
              <Link to={postJobTo}>
                <Button size="lg" className="gap-2">
                  Post a Job <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-xl">
          <h2 className="font-display text-2xl text-ink md:text-3xl">Why hire on The Ready Brand</h2>
          <p className="mt-3 text-ink-muted">
            A marketplace built around career-ready talent — not just anyone with a profile.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-border bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
                {b.icon}
              </div>
              <h3 className="mt-4 font-semibold text-ink">{b.title}</h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" className="border-y border-border bg-surface-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl text-ink md:text-3xl">Hiring plans</h2>
            <p className="mt-3 text-ink-muted">
              Start free, upgrade when you need more visibility and applicant access.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {hirerPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-3xl border bg-white p-8 transition hover:-translate-y-1 hover:shadow-soft ${
                  plan.slug === 'premium' ? 'border-primary shadow-lift' : 'border-border'
                }`}
              >
                <h3 className="text-xl font-bold text-ink">{plan.name}</h3>
                <p className="mt-2 font-display text-3xl text-primary">
                  {plan.price === null
                    ? 'Custom'
                    : plan.price === 0
                      ? 'Free'
                      : `${formatNaira(plan.price)}/month`}
                </p>
                <p className="mt-3 text-sm text-ink-muted leading-relaxed">{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-ink">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.slug === 'custom' ? '/auth/signup?role=hirer' : postJobTo}
                  className="mt-8 block"
                >
                  <Button className="w-full" variant={plan.slug === 'premium' ? 'primary' : 'outline'}>
                    {plan.slug === 'custom' ? 'Contact sales' : 'Post a Job'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl border border-border bg-white px-8 py-12 text-center md:px-16">
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            Ready to fill your next role?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-ink-muted">
            Create a company account, publish your opening, and start receiving applications from
            candidates across Nigeria.
          </p>
          <Link to={postJobTo} className="mt-8 inline-block">
            <Button size="lg" className="gap-2">
              Post a Job <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
