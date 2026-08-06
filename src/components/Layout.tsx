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
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuth, dashboardPath } from '../context/AuthContext';
import { Button } from './ui';
import { cn } from '../lib/utils';
import type { UserRole } from '../types';

export function PublicLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className="text-sm font-medium text-ink-muted hover:text-primary"
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="font-display text-xl text-primary tracking-tight">
            The Ready Brand
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navLink('/jobs', 'Jobs')}
            {navLink('/services', 'CV Services')}
            {navLink('/pricing', 'Pricing')}
            {navLink('/blog', 'Blog')}
            {user ? (
              <>
                <Link
                  to={dashboardPath(user.role)}
                  className="text-sm font-medium text-ink-muted hover:text-primary"
                >
                  Dashboard
                </Link>
                <Button size="sm" variant="outline" onClick={logout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="text-sm font-medium text-ink-muted hover:text-primary">
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
            className="md:hidden rounded-lg p-2 hover:bg-surface-muted"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <div className="space-y-3 border-t border-border px-4 py-4 md:hidden">
            <Link to="/jobs" onClick={() => setOpen(false)} className="block text-sm font-medium">
              Jobs
            </Link>
            <Link to="/services" onClick={() => setOpen(false)} className="block text-sm font-medium">
              CV Services
            </Link>
            <Link to="/pricing" onClick={() => setOpen(false)} className="block text-sm font-medium">
              Pricing
            </Link>
            <Link to="/blog" onClick={() => setOpen(false)} className="block text-sm font-medium">
              Blog
            </Link>
            {user ? (
              <>
                <Link
                  to={dashboardPath(user.role)}
                  onClick={() => setOpen(false)}
                  className="block text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button type="button" onClick={logout} className="text-sm font-medium text-primary">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/login" onClick={() => setOpen(false)} className="block text-sm">
                  Log in
                </Link>
                <Link to="/auth/signup" onClick={() => setOpen(false)} className="block text-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </header>
      <Outlet />
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
    { to: '/admin/subscriptions', label: 'Subscriptions', icon: <CreditCard size={18} /> },
    { to: '/admin/blog', label: 'Blog', icon: <BookOpen size={18} /> },
  ],
};

export function ProtectedLayout({ role }: { role: UserRole }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
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
  const sidebarWidth = collapsed ? 'lg:grid-cols-[72px_1fr]' : 'lg:grid-cols-[240px_1fr]';

  return (
    <div className={cn('min-h-screen bg-surface text-ink lg:grid', sidebarWidth)}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-white p-3 transition-all duration-200 lg:static lg:translate-x-0',
          collapsed ? 'w-[72px]' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className={cn('mb-6 flex items-center', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && (
            <Link to="/" className="font-display text-lg text-primary">
              Ready Brand
            </Link>
          )}
          <button
            type="button"
            className="hidden rounded-lg p-2 text-ink-muted hover:bg-surface-muted lg:inline-flex"
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
                    ? 'bg-primary text-white'
                    : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
                )
              }
            >
              {link.icon}
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          {!collapsed && <p className="mb-2 truncate text-xs text-ink-muted">{user.name}</p>}
          <Button
            variant="ghost"
            size="sm"
            className={cn('w-full', collapsed ? 'justify-center px-0' : 'justify-start')}
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
      </aside>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="font-display text-primary">Dashboard</span>
        </div>
        <main className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
