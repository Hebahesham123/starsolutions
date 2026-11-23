import type { Metadata } from 'next';
import seoCopy from '@/data/seo.json';
import { localeHref, type Locale } from './i18n';
import { OG_IMAGE } from './schema';

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

/* ------------------------------------------------------------------ */
/* Titles, descriptions and share cards                                */
/* ------------------------------------------------------------------ */


type Copy = { title?: string; description?: string };
const COPY = seoCopy as unknown as Record<Locale, Record<string, Copy>>;

const SITE_NAME: Record<Locale, string> = { en: 'StarSolution.ai', ar: 'ستار سوليوشن' };
const OG_LOCALE: Record<Locale, string> = { en: 'en_US', ar: 'ar_EG' };
const DEFAULT_TITLE: Record<Locale, string> = {
  en: 'StarSolution.ai — More orders. More revenue. Less work.',
  ar: 'ستار سوليوشن — طلبات أكثر. إيرادات أكبر. جهد أقل.',
};

/**
 * Google shows about 155 characters of a description and cuts the rest
 * mid-word. Long summaries are trimmed at a word boundary instead.
 */
function clip(text: string | null | undefined, max = 155): string | undefined {
  if (!text) return undefined;
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:—–-]+$/, '')}…`;
}

/**
 * Wraps a page's metadata with everything search and sharing need, without
 * the page having to repeat it:
 *
 *  - an override from src/data/seo.json when the page has one (the copy
 *    Martha writes lands there, one file for every page and both languages);
 *  - descriptions trimmed to what Google shows;
 *  - Open Graph and Twitter cards with this page's own title, description,
 *    URL and the share image, so a link pasted into WhatsApp, Facebook or
 *    LinkedIn previews this page and not the home page.
 *
 * The locale and path are read from `alternates.canonical`, which every page
 * already sets through `alternates()`. Nothing here renders on the page.
 */
export function withSeo(meta: Metadata, opts: SeoOptions = {}): Metadata {
  const canonical = String(meta.alternates?.canonical ?? '/');
  const locale: Locale = canonical === '/ar' || canonical.startsWith('/ar/') ? 'ar' : 'en';
  const path = locale === 'ar' ? canonical.slice(3) || '/' : canonical;
  // Pages whose copy lives with their own data (blog posts: the posts table)
  // pass copy:false, so a stale seo.json entry can never override it.
  const copy = opts.copy === false ? {} : COPY[locale]?.[path] ?? {};

  const pageTitle = typeof meta.title === 'string' ? meta.title : undefined;
  // An override is the whole title, as written: no " · StarSolution.ai" added.
  const title: Metadata['title'] = copy.title ? { absolute: copy.title } : meta.title;
  const shareTitle = opts.shareTitle ?? copy.title ?? (pageTitle ? `${pageTitle} · ${SITE_NAME[locale]}` : DEFAULT_TITLE[locale]);
  const description = copy.description ?? clip(meta.description);
  const shareDescription = opts.shareDescription ? clip(opts.shareDescription) : description;
  const image = opts.image ?? { url: OG_IMAGE.src[locale], width: OG_IMAGE.width, height: OG_IMAGE.height };

  return {
    ...meta,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    openGraph: {
      ...(opts.article
        ? { type: 'article', publishedTime: opts.article.publishedTime, modifiedTime: opts.article.modifiedTime }
        : { type: 'website' }),
      siteName: SITE_NAME[locale],
      locale: OG_LOCALE[locale],
      url: opts.url ?? canonical,
      title: shareTitle,
      ...(shareDescription ? { description: shareDescription } : {}),
      images: [{ ...image, alt: opts.imageAlt || SITE_NAME[locale] }],
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      ...(shareDescription ? { description: shareDescription } : {}),
      images: [image.url],
    },
  };
}

export type SeoOptions = {
  /** false: ignore src/data/seo.json for this page. */
  copy?: boolean;
  shareTitle?: string;
  shareDescription?: string;
  image?: { url: string; width: number; height: number };
  imageAlt?: string;
  /** og:url when the canonical points elsewhere. */
  url?: string;
  article?: { publishedTime: string; modifiedTime?: string };
};

/**
 * Favicon and app icons for every page (files made by scripts/make-icons.mjs
 * from public/logo.png). /favicon.ico is also served at the root for browsers
 * and crawlers that ask for it directly.
 */
export const SITE_ICONS: Metadata['icons'] = {
  icon: [
    { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
    { url: '/icon-48.png', type: 'image/png', sizes: '48x48' },
    { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
  ],
  apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
};
export const SITE_MANIFEST = '/site.webmanifest';
