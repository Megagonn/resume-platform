import { Sparkles } from 'lucide-react';
import type { ServiceExample } from '../types';

export function ServiceExamplesSection({
  examples,
  title = 'Examples & outcomes',
}: {
  examples: ServiceExample[];
  title?: string;
}) {
  if (!examples.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="max-w-xl">
        <h2 className="font-display text-2xl text-ink md:text-3xl">{title}</h2>
        <p className="mt-3 text-ink-muted">
          Illustrative transformations and results from similar client work.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {examples.map((ex) => (
          <div key={ex.title} className="rounded-2xl border border-border bg-white p-6">
            <h3 className="font-semibold text-ink">{ex.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{ex.description}</p>
            {ex.highlight && (
              <p className="mt-4 flex items-start gap-2 text-sm font-medium text-primary">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                {ex.highlight}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
