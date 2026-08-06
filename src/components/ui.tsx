import { cn } from '../lib/utils';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

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
        'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        variant === 'primary' &&
          'bg-primary text-white hover:bg-primary-700 shadow-md shadow-primary/20',
        variant === 'secondary' &&
          'bg-surface-muted text-ink hover:bg-primary-100',
        variant === 'ghost' && 'bg-transparent text-ink-muted hover:bg-surface-muted',
        variant === 'outline' &&
          'border border-primary/20 text-primary hover:bg-primary-50',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
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
          'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15',
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
          'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 min-h-[120px]',
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
          'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
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
        tone === 'neutral' && 'bg-stone-100 text-stone-700',
        tone === 'success' && 'bg-emerald-50 text-emerald-700',
        tone === 'warn' && 'bg-amber-50 text-amber-800',
        tone === 'danger' && 'bg-red-50 text-red-700',
        tone === 'brand' && 'bg-primary-50 text-primary'
      )}
    >
      {children}
    </span>
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

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-muted/50 px-6 py-16 text-center">
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

export function statusTone(
  status: string
): 'neutral' | 'success' | 'warn' | 'danger' | 'brand' {
  if (['open', 'hired', 'delivered', 'shortlisted', 'paid'].includes(status)) return 'success';
  if (['reviewing', 'in_progress', 'pending', 'new'].includes(status)) return 'warn';
  if (['closed', 'rejected', 'cancelled', 'draft'].includes(status)) return 'danger';
  return 'brand';
}
