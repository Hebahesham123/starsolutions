import faq from '@/data/solution-faq.json';
import type { Locale } from '@/lib/i18n';
import type { FaqItem } from '@/lib/schema';

/** The FAQ for one solution page, in one language, or an empty list. */
export function solutionFaq(slug: string, locale: Locale): FaqItem[] {
  const entry = (faq as Record<string, Partial<Record<Locale, FaqItem[]>>>)[slug];
  return entry?.[locale] ?? [];
}
