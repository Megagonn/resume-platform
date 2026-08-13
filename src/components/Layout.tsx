import { Link, NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Building2,
  Users,
  ClipboardList,
  UserCircle,
  Menu,
  X,
  CreditCard,
  ChevronsLeft,
  ChevronsRight,
  BookOpen,
  Tag,
  Moon,
  Sun,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuth, dashboardPath } from '../context/AuthContext';
import { Avatar, Button } from './ui';
import { cn } from '../lib/utils';
import { useDarkMode } from '../hooks/useDarkMode';
import type { UserRole } from '../types';

function BrandMark({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5', compact && 'justify-center')}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-display text-sm text-white shadow-md shadow-primary/30 dark:bg-accent-light dark:text-primary-900 dark:shadow-none">
        RB
      </span>
      {!compact && (
        <span className="font-display text-lg tracking-tight text-primary dark:text-accent-light">
          The Ready Brand
        </span>
      )}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white/60 dark:border-primary-700 dark:bg-primary-800/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:justify-between">
        <div>
          <BrandMark />
          <p className="mt-3 max-w-sm text-sm text-ink-muted dark:text-primary-200">
            Professional CV writing and a job marketplace for candidates and hirers.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm sm:grid-cols-3">
          <Link
            to="/jobs"
            className="text-ink-muted transition hover:text-primary dark:text-primary-200 dark:hover:text-accent-light"
          >
            Jobs
          </Link>
          <Link
            to="/services"
            className="text-ink-muted transition hover:text-primary dark:text-primary-200 dark:hover:text-accent-light"
          >
            CV services
          </Link>
          <Link
            to="/pricing"
            className="text-ink-muted transition hover:text-primary dark:text-primary-200 dark:hover:text-accent-light"
          >
            Pricing
          </Link>
          <Link
            to="/blog"
            className="text-ink-muted transition hover:text-primary dark:text-primary-200 dark:hover:text-accent-light"
          >
            Blog
          </Link>
          <a
            href="https://wa.me/2347064641892"
            target="_blank"
            rel="noreferrer"
            className="text-ink-muted transition hover:text-primary dark:text-primary-200 dark:hover:text-accent-light"
          >
            WhatsApp
          </a>
          <a
            href="mailto:hannah.cvwriter@gmail.com"
            className="text-ink-muted transition hover:text-primary dark:text-primary-200 dark:hover:text-accent-light"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { isDark, toggle } = useDarkMode();

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className="text-sm font-medium text-ink-muted transition hover:text-primary dark:text-primary-200 dark:hover:text-accent-light"
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-surface text-ink dark:bg-primary-900 dark:text-primary-50">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/80 backdrop-blur-md dark:border-primary-700 dark:bg-primary-900/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <BrandMark />
          <nav className="hidden items-center gap-6 md:flex">
            {navLink('/jobs', 'Jobs')}
            {navLink('/services', 'CV Services')}
            {navLink('/pricing', 'Pricing')}
            {navLink('/blog', 'Blog')}
            <button
              type="button"
              onClick={toggle}
              className="rounded-lg p-2 text-ink-muted transition hover:bg-surface-muted dark:text-primary-200 dark:hover:bg-primary-700/70"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {user ? (
              <>
                <Link
                  to={dashboardPath(user.role)}
                  className="text-sm font-medium text-ink-muted transition hover:text-primary dark:text-primary-200 dark:hover:text-accent-light"
                >
                  Dashboard
                </Link>
                <Button size="sm" variant="outline" onClick={logout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-ink-muted transition hover:text-primary dark:text-primary-200 dark:hover:text-accent-light"
                >
                  Log in
                </Link>
                <Link to="/auth/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </nav>
          <button
            type="button"
            className="rounded-lg p-2 text-ink transition hover:bg-surface-muted dark:text-primary-100 dark:hover:bg-primary-700/70 md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <div className="space-y-3 border-t border-border px-4 py-4 dark:border-primary-700 dark:bg-primary-900 md:hidden">
            <Link
              to="/jobs"
              onClick={() => setOpen(false)}
              className="block text-sm font-medium dark:text-primary-100"
            >
              Jobs
            </Link>
            <Link
              to="/services"
              onClick={() => setOpen(false)}
              className="block text-sm font-medium dark:text-primary-100"
            >
              CV Services
            </Link>
            <Link
              to="/pricing"
              onClick={() => setOpen(false)}
              className="block text-sm font-medium dark:text-primary-100"
            >
              Pricing
            </Link>
            <Link
              to="/blog"
              onClick={() => setOpen(false)}
              className="block text-sm font-medium dark:text-primary-100"
            >
              Blog
            </Link>
            {user ? (
              <>
                <Link
                  to={dashboardPath(user.role)}
                  onClick={() => setOpen(false)}
                  className="block text-sm font-medium dark:text-primary-100"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm font-medium text-primary dark:text-accent-light"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  onClick={() => setOpen(false)}
                  className="block text-sm dark:text-primary-100"
                >
                  Log in
                </Link>
                <Link
                  to="/auth/signup"
                  onClick={() => setOpen(false)}
                  className="block text-sm dark:text-primary-100"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </header>
      <Outlet />
      <SiteFooter />
    </div>
  );
}

const navByRole: Record<UserRole, { to: string; label: string; icon: ReactNode }[]> = {
  seeker: [
    { to: '/seeker', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { to: '/seeker/applications', label: 'Applications', icon: <ClipboardList size={18} /> },
    { to: '/seeker/orders', label: 'CV Orders', icon: <Package size={18} /> },
    { to: '/seeker/profile', label: 'Profile', icon: <UserCircle size={18} /> },
    { to: '/jobs', label: 'Browse jobs', icon: <Briefcase size={18} /> },
    { to: '/services', label: 'CV services', icon: <FileText size={18} /> },
    { to: '/pricing', label: 'Pricing', icon: <Tag size={18} /> },
  ],
  hirer: [
    { to: '/hirer', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { to: '/hirer/jobs', label: 'Openings', icon: <Briefcase size={18} /> },
    { to: '/hirer/company', label: 'Profile', icon: <Building2 size={18} /> },
    { to: '/hirer/billing', label: 'Billing', icon: <CreditCard size={18} /> },
    { to: '/pricing', label: 'Pricing', icon: <Tag size={18} /> },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
    { to: '/admin/jobs', label: 'Jobs', icon: <Briefcase size={18} /> },
    { to: '/admin/applications', label: 'Applications', icon: <ClipboardList size={18} /> },
    { to: '/admin/orders', label: 'CV Orders', icon: <Package size={18} /> },
    { to: '/admin/packages', label: 'Packages', icon: <FileText size={18} /> },
    { to: '/admin/subscriptions', label: 'Companies', icon: <Building2 size={18} /> },
    { to: '/admin/blog', label: 'Blog', icon: <BookOpen size={18} /> },
  ],
};

export function ProtectedLayout({ role }: { role: UserRole }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggle } = useDarkMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }, [collapsed]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== role) return <Navigate to={dashboardPath(user.role)} replace />;

  const links = navByRole[role];
  const sidebarWidth = collapsed ? 'lg:grid-cols-[80px_1fr]' : 'lg:grid-cols-[260px_1fr]';

  return (
    <div className={cn('min-h-screen bg-surface text-ink dark:bg-primary-900 dark:text-primary-50 lg:grid', sidebarWidth)}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-white p-3 transition-all duration-200 dark:border-primary-700 dark:bg-primary-800 lg:static lg:translate-x-0',
          collapsed ? 'w-[80px]' : 'w-[260px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div
          className={cn(
            'mb-6 flex items-center',
            collapsed ? 'flex-col gap-2' : 'justify-between'
          )}
        >
          <BrandMark compact={collapsed} />
          <button
            type="button"
            className="hidden rounded-lg p-2 text-ink-muted hover:bg-surface-muted dark:text-primary-200 dark:hover:bg-primary-700/60 lg:inline-flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
          <button type="button" className="lg:hidden" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto pb-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === `/${role}`}
              title={link.label}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/25 dark:bg-accent-light dark:text-primary-900 dark:shadow-none'
                    : 'text-ink-muted hover:bg-surface-muted hover:text-ink dark:text-primary-200 dark:hover:bg-primary-700/60 dark:hover:text-primary-50'
                )
              }
            >
              {link.icon}
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-2 border-t border-border pt-4">
          {!collapsed && (
            <div className="mb-2 flex items-center gap-3 px-1">
              <Avatar name={user.name} src={user.avatarUrl} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                <p className="truncate text-xs capitalize text-ink-muted">{user.role}</p>
              </div>
            </div>
          )}
          <div className={cn('flex gap-1', collapsed && 'flex-col items-center')}>
            <Button
              variant="ghost"
              size="sm"
              className={cn('flex-1', collapsed ? 'justify-center px-0' : 'justify-start')}
              title="Toggle theme"
              onClick={toggle}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {!collapsed && (isDark ? ' Light' : ' Dark')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(collapsed ? 'justify-center px-0' : 'justify-start')}
              title="Log out"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <LogOut size={16} />
              {!collapsed && ' Log out'}
            </Button>
          </div>
        </div>
      </aside>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur dark:border-primary-700 dark:bg-primary-900/95 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1 text-ink dark:text-primary-100"
          >
            <Menu size={20} />
          </button>
          <span className="font-display text-primary dark:text-accent-light">Dashboard</span>
        </div>
        <main className="mx-auto max-w-7xl px-4 py-8 animate-fade-in lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
