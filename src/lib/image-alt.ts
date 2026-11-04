import alts from '@/data/image-alt.json';
import type { Locale } from '@/lib/i18n';

/**
 * Alt text for a picture in /public, keyed by its path without the extension
 * (e.g. "goals/increase-revenue", "shots/beauty-bareg-before").
 * Kept in the repo, not in Supabase: the goals table has no column for it.
 */
export function imageAlt(key: string, locale: Locale, fallback: string): string {
  const table = (alts as Record<string, Record<string, string>>)[locale];
  return table?.[key] ?? fallback;
}
