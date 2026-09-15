import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ServiceFaq } from '../types';

export function FaqSection({ faqs, title = 'Frequently asked questions' }: { faqs: ServiceFaq[]; title?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sorted = [...faqs].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  if (!sorted.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="max-w-xl">
        <h2 className="font-display text-2xl text-ink md:text-3xl">{title}</h2>
        <p className="mt-3 text-ink-muted">Answers to common questions about this service.</p>
      </div>
      <div className="mt-10 max-w-3xl divide-y divide-border rounded-2xl border border-border bg-white">
        {sorted.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.question}>
              <button
                type="button"
                className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-ink">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'mt-0.5 h-5 w-5 shrink-0 text-ink-muted transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-ink-muted">{faq.answer}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
