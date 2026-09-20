import { localeHref, type Locale } from './i18n';

/**
 * `canonical` plus the hreflang alternates for one page.
 *
 * Both locales are declared by default, because most routes exist in both.
 * They do not all: the Arabic dataset carries entries the English one has no
 * row for and vice versa — `trading-system` is Arabic-only, `martha-talaat`
 * English-only — and the legal and docs pages are English by design. Pointing
 * hreflang at a URL that 404s is worse than omitting it, so a page that has no
 * twin says so and only its own language is listed.
 *
 * `x-default` follows English, which is what an unmatched reader gets today.
 */
export function alternates(
  locale: Locale,
  path: string,
  has: { en?: boolean; ar?: boolean } = {},
) {
  const inEn = has.en ?? true;
  const inAr = has.ar ?? true;
  const languages: Record<string, string> = {};
  if (inEn) languages.en = localeHref('en', path);
  if (inAr) languages.ar = localeHref('ar', path);
  if (inEn) languages['x-default'] = localeHref('en', path);
  return { canonical: localeHref(locale, path), languages };
}
