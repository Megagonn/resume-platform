import { cn, initials } from '../lib/utils';
import {
  useEffect,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
} from 'react';
import { Search, X } from 'lucide-react';

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        variant === 'primary' &&
          'bg-primary text-white hover:bg-primary-700 shadow-md shadow-primary/20 dark:bg-accent-light dark:text-primary-900 dark:hover:bg-accent dark:shadow-none',
        variant === 'secondary' &&
          'bg-surface-muted text-ink hover:bg-primary-100 dark:hover:bg-primary-700',
        variant === 'ghost' &&
          'bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink dark:hover:bg-primary-700/60',
        variant === 'outline' &&
          'border border-primary/20 text-primary hover:bg-primary-50 dark:border-accent/50 dark:text-accent-light dark:hover:bg-primary-700/50 dark:hover:text-primary-50',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400',
        className
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-medium text-ink-muted">{label}</span>}
      <input
        className={cn(
          'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15',
          className
        )}
        {...props}
      />
    </label>
  );
}

export function Textarea({
  className,
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-medium text-ink-muted">{label}</span>}
      <textarea
        className={cn(
          'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 min-h-[120px]',
          className
        )}
        {...props}
      />
    </label>
  );
}

export function Select({
  className,
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-medium text-ink-muted">{label}</span>}
      <select
        className={cn(
          'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      <input
        className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warn' | 'danger' | 'brand';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tone === 'neutral' &&
          'bg-stone-100 text-stone-700 dark:bg-primary-700 dark:text-primary-100',
        tone === 'success' &&
          'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        tone === 'warn' &&
          'bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
        tone === 'danger' &&
          'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        tone === 'brand' &&
          'bg-primary-50 text-primary dark:bg-primary-700/70 dark:text-accent-light'
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({
  name,
  src,
  size = 'md',
}: {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const dim =
    size === 'sm'
      ? 'h-8 w-8 text-[11px]'
      : size === 'lg'
        ? 'h-14 w-14 text-lg'
        : size === 'xl'
          ? 'h-20 w-20 text-2xl'
          : 'h-10 w-10 text-sm';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-100 to-accent-light font-semibold text-primary ring-2 ring-white dark:from-primary-700 dark:to-accent dark:text-primary-50 dark:ring-primary-800',
        dim
      )}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initials(name)}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl text-ink tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-muted/40 px-6 py-16 text-center">
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary">
          {icon}
        </div>
      )}
      <p className="font-display text-xl text-ink">{title}</p>
      {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-white p-6 shadow-sm shadow-primary/5',
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-ink-muted">{label}</p>
          <p className="mt-1 font-display text-3xl text-primary">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-surface-muted/70 px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-xl text-ink">{value}</p>
    </div>
  );
}

export function TableShell({
  children,
  minWidth = 'min-w-[720px]',
}: {
  children: ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm shadow-primary/5">
      <table className={cn('w-full text-left text-sm', minWidth)}>{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-3 font-medium', className)}>{children}</th>
  );
}

export function Td({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <td className={cn('px-4 py-3.5 align-middle', className)}>{children}</td>;
}

export function FilterPills({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-2xl bg-surface-muted p-1">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            'rounded-xl px-3 py-1.5 text-sm font-medium transition',
            value === opt.id
              ? 'bg-white text-primary shadow-sm dark:bg-primary-700 dark:text-accent-light'
              : 'text-ink-muted hover:text-ink dark:text-primary-200 dark:hover:text-primary-50'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        aria-label="Close details"
        onClick={onClose}
      />
      <aside
        className={cn(
          'relative flex h-full w-full flex-col bg-white shadow-drawer animate-slide-in-right',
          wide ? 'max-w-2xl' : 'max-w-lg'
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h2 className="font-display text-2xl text-ink">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-ink-muted hover:bg-surface-muted hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </aside>
    </div>
  );
}

export function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{title}</h3>
      {children}
    </section>
  );
}

export function statusTone(
  status: string
): 'neutral' | 'success' | 'warn' | 'danger' | 'brand' {
  if (['open', 'hired', 'delivered', 'shortlisted', 'paid', 'published', 'active', 'premium'].includes(status))
    return 'success';
  if (['reviewing', 'in_progress', 'pending', 'new', 'draft', 'free'].includes(status)) return 'warn';
  if (['closed', 'rejected', 'cancelled', 'past_due'].includes(status)) return 'danger';
  return 'brand';
}
