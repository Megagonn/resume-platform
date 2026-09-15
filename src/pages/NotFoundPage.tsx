import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, FileText, Home, Search } from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/ui';
import { usePageMeta } from '../hooks/usePageMeta';

const quickLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/jobs', label: 'Browse jobs', icon: Briefcase },
  { to: '/services', label: 'CV services', icon: FileText },
];

export default function NotFoundPage() {
  usePageMeta('Page not found | The Ready Brand');

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(93,46,70,0.12),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(93,46,70,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(232,196,210,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute -left-20 top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl dark:bg-accent/10" />
      <div className="pointer-events-none absolute -right-16 bottom-16 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative mx-auto w-full max-w-2xl text-center animate-fade-in">
        <div className="mb-8 flex justify-center">
          <BrandMark link={false} />
        </div>

        <p className="font-display text-[7rem] leading-none tracking-tight text-primary/15 dark:text-accent/20 sm:text-[9rem]">
          404
        </p>

        <div className="-mt-10 sm:-mt-14">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent-light">
            <Search className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl text-ink dark:text-primary-50 sm:text-4xl">
            This page doesn&apos;t exist
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-muted dark:text-primary-200">
            The link may be broken, outdated, or the page may have moved. Let&apos;s get you back on
            track.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button size="lg">
              <Home size={18} />
              Back to home
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              if (window.history.length > 1) window.history.back();
              else window.location.assign('/');
            }}
          >
            <ArrowLeft size={18} />
            Go back
          </Button>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-3">
          {quickLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-2xl border border-border bg-white/70 px-4 py-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lift dark:border-primary-700 dark:bg-primary-800/80 dark:hover:border-accent/40"
            >
              <Icon className="h-5 w-5 text-primary transition group-hover:scale-110 dark:text-accent-light" />
              <p className="mt-3 text-sm font-semibold text-ink dark:text-primary-50">{label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
