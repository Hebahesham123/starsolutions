import content from '@/data/entry-content.json';
import type { Locale } from '@/lib/i18n';
import type { FaqItem } from '@/lib/schema';
import type { Entry } from '@/lib/types';

type Extra = { body?: string; faq?: FaqItem[] };
const DATA = content as unknown as Record<string, Record<string, Partial<Record<Locale, Extra>>>>;

/**
 * The long-form part of an entry page: a Markdown `body` (rendered after the
 * points with the blog's renderer) and its FAQ.
 *
 * A field on the entry itself wins — a `body`/`faq` column in Supabase for
 * English, or the same keys on a site.ar.json entry. Until those exist, the
 * copy lives in src/data/entry-content.json, keyed by section ('automations',
 * 'systems', …), then slug, then language. Any page with neither renders as
 * before.
 */
export function entryContent(section: string, entry: Entry, locale: Locale): { body: string; faq: FaqItem[] } {
  const stored = DATA[section]?.[entry.slug]?.[locale] ?? {};
  return {
    body: entry.body || stored.body || '',
    faq: entry.faq?.length ? entry.faq : stored.faq ?? [],
  };
}
