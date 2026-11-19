import content from '@/data/entry-content.json';
import type { Locale } from '@/lib/i18n';
import type { FaqItem } from '@/lib/schema';
import type { Entry } from '@/lib/types';

type Extra = { body?: string; faq?: FaqItem[] };
/** Per slug: one block per language, plus optional `more` (slugs, both languages). */
type Item = Partial<Record<Locale, Extra>> & { more?: string[] };
const DATA = content as unknown as Record<string, Record<string, Item>>;

/**
 * Extra slugs for an entry's "More in …" panel, beyond its list neighbours.
 * For pairs that belong together but are not next to each other in the list
 * (e.g. the accounting and courier systems).
 */
export function entryMore(section: string, slug: string): string[] {
  return DATA[section]?.[slug]?.more ?? [];
}

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
