import { Star } from 'lucide-react';
import type { ServiceTestimonial } from '../types';

export function TestimonialsSection({
  testimonials,
  title = 'What clients say',
}: {
  testimonials: ServiceTestimonial[];
  title?: string;
}) {
  if (!testimonials.length) return null;

  return (
    <section className="border-y border-border bg-surface-muted/40 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-xl">
          <h2 className="font-display text-2xl text-ink md:text-3xl">{title}</h2>
          <p className="mt-3 text-ink-muted">Real feedback from graduates and professionals we have helped.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <blockquote
              key={`${t.name}-${t.role}`}
              className="rounded-2xl border border-border bg-white p-6"
            >
              {t.rating && (
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
              )}
              <p className="text-sm leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 text-sm">
                <span className="font-semibold text-ink">{t.name}</span>
                <span className="text-ink-muted">
                  {' '}
                  · {t.role}
                  {t.company ? `, ${t.company}` : ''}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
