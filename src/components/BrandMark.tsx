import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const ICON = '/images/ready-brand-icon.png';
const LOGO = '/images/ready-brand-logo.png';

type BrandMarkProps = {
  compact?: boolean;
  variant?: 'default' | 'hero';
  className?: string;
  link?: boolean;
};

export function BrandMark({
  compact,
  variant = 'default',
  className,
  link = true,
}: BrandMarkProps) {
  let content: ReactNode;

  if (compact) {
    content = (
      <img src={ICON} alt="The Ready Brand" className="h-8 w-8 object-contain" />
    );
  } else if (variant === 'hero') {
    content = (
      <div className="flex items-center gap-3">
        <img src={ICON} alt="" className="h-11 w-11 object-contain" aria-hidden />
        <span className="font-display text-lg tracking-wide text-white/90 drop-shadow-sm sm:text-xl">
          The Ready Brand
        </span>
      </div>
    );
  } else {
    content = (
      <>
        <img
          src={LOGO}
          alt="The Ready Brand"
          className="h-9 w-auto max-w-[200px] object-contain object-left dark:hidden sm:max-w-none"
        />
        <div className="hidden items-center gap-2.5 dark:flex">
          <img src={ICON} alt="" className="h-8 w-8 object-contain" aria-hidden />
          <span className="font-display text-lg tracking-tight text-accent-light">
            The Ready Brand
          </span>
        </div>
      </>
    );
  }

  const classes = cn('flex items-center', compact && 'justify-center', className);

  if (link) {
    return (
      <Link to="/" className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
