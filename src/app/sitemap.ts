import type { MetadataRoute } from 'next';
import {
  getSolutions, getAutomations, getSystems, getGoals, getCaseStudies, getTeam, getProjects,
} from '@/lib/content';
import { getContent, localeHref, type Locale } from '@/lib/i18n';
import { getPosts, postLastmod } from '@/lib/posts';
import { SITE_URL } from '@/lib/schema';

/**
 * /sitemap.xml, built from the same data the pages are built from — so a new
 * solution, post or team member is listed the moment its page exists, and a
 * hidden one drops out with it.
 *
 * Each URL carries the same hreflang set as the page's own <link rel="alternate">
 * tags (the rule in `alternates()` in lib/seo.ts: list a twin only when it
 * exists, English is `x-default`). Single-language pages list themselves, as
 * their heads do.
 *
 * `lastModified`, most specific first:
 *  - blog posts: the content-updated date (else the published date) from the
 *    posts table. Only live posts, only in their enabled languages, and not
 *    noindex ones; a scheduled post appears once its time has passed;
 *  - English entries served from Supabase: the row's `updated_at`, which the
 *    touch_updated_at trigger moves on every edit in /admin;
 *  - everything else (static pages, Arabic entries from site.ar.json, project
 *    pages): the deploy date, since those only change when the site is
 *    deployed.
 *
 * This replaces the static public/sitemap.xml, which must not exist alongside
 * it: a file in /public is served before this route.
 */

/** Routes with no slug. /docs, /privacy and /terms are English-only by design. */
const STATIC_EN = [
  '/', '/about', '/solutions', '/automations', '/systems', '/goals', '/case-studies',
  '/work', '/team', '/blog', '/results', '/process', '/contact', '/docs', '/privacy', '/terms',
];
const STATIC_AR = [
  '/', '/about', '/solutions', '/automations', '/systems', '/goals', '/case-studies',
  '/work', '/team', '/blog', '/results', '/process', '/contact',
];

type Row = { slug: string; hidden?: boolean; updated_at?: string | null };

/* Rebuilt at most once a minute, like the pages: that is what brings a
   scheduled post in on time, and a publish in /admin revalidates it at once. */
export const revalidate = 60;

/** When this build ran: the deploy date for content that ships with the code. */
const DEPLOYED = new Date().toISOString();
const slugs = (section: string, rows: Row[]) =>
  rows.filter((row) => !row.hidden).map((row) => `${section}/${row.slug}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // English reads through the loaders (Supabase when configured, seed
  // otherwise), exactly as the English pages do. Arabic reads site.ar.json,
  // exactly as the Arabic pages do.
  const [solutions, automations, systems, goals, cases, team, projects] = await Promise.all([
    getSolutions(), getAutomations(), getSystems(), getGoals(), getCaseStudies(), getTeam(), getProjects(),
  ]);
  const ar = getContent('ar');
  const [postsEn, postsAr] = (await Promise.all([getPosts('en'), getPosts('ar')]))
    .map((list) => list.filter((p) => !p.seo.noindex));

  const paths: Record<Locale, string[]> = {
    en: [
      ...STATIC_EN,
      ...slugs('/solutions', solutions),
      ...slugs('/automations', automations),
      ...slugs('/systems', systems),
      ...slugs('/goals', goals),
      ...slugs('/case-studies', cases),
      ...slugs('/work', projects),
      ...slugs('/team', team),
      ...slugs('/blog', postsEn),
    ],
    ar: [
      ...STATIC_AR,
      ...slugs('/solutions', ar.solutions),
      ...slugs('/automations', ar.automations),
      ...slugs('/systems', ar.systems),
      ...slugs('/goals', ar.goals),
      ...slugs('/case-studies', ar.caseStudies),
      ...slugs('/work', ar.projects),
      ...slugs('/team', ar.team),
      ...slugs('/blog', postsAr),
    ],
  };
  const has = { en: new Set(paths.en), ar: new Set(paths.ar) };

  // Real content dates. Anything missing here falls back to DEPLOYED.
  const rowDates = (section: string, rows: Row[]) =>
    rows.filter((r) => !r.hidden && r.updated_at).map((r) => [`${section}/${r.slug}`, r.updated_at as string] as const);
  const dates: Record<Locale, Map<string, string>> = {
    en: new Map([
      ...rowDates('/solutions', solutions),
      ...rowDates('/automations', automations),
      ...rowDates('/systems', systems),
      ...rowDates('/goals', goals),
      ...rowDates('/case-studies', cases),
      ...rowDates('/team', team),
      ...postsEn.map((p) => [`/blog/${p.slug}`, postLastmod(p)] as const),
    ]),
    ar: new Map(postsAr.map((p) => [`/blog/${p.slug}`, postLastmod(p)] as const)),
  };

  // The home page as the head writes it (no trailing slash), so the two match
  // character for character; both are the same URL.
  const abs = (locale: Locale, path: string) => `${SITE_URL}${localeHref(locale, path)}`.replace(/\/$/, '');

  const entry = (locale: Locale, path: string): MetadataRoute.Sitemap[number] => {
    // A post in one language carries no hreflang, as its head does not.
    if (path.startsWith('/blog/') && !(has.en.has(path) && has.ar.has(path))) {
      return { url: abs(locale, path), lastModified: dates[locale].get(path) ?? DEPLOYED };
    }
    const languages: Record<string, string> = {};
    if (has.en.has(path)) languages.en = abs('en', path);
    if (has.ar.has(path)) languages.ar = abs('ar', path);
    if (has.en.has(path)) languages['x-default'] = abs('en', path);
    return {
      url: abs(locale, path),
      lastModified: dates[locale].get(path) ?? DEPLOYED,
      alternates: { languages },
    };
  };

  // De-duplicated in case a slug appears twice in a dataset.
  const unique = (list: string[]) => Array.from(new Set(list));
  return [
    ...unique(paths.en).map((path) => entry('en', path)),
    ...unique(paths.ar).map((path) => entry('ar', path)),
  ];
}
