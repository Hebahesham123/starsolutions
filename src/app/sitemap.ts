import type { MetadataRoute } from 'next';
import {
  getSolutions, getAutomations, getSystems, getGoals, getCaseStudies, getTeam, getProjects,
} from '@/lib/content';
import { getContent, getPosts, localeHref, type Locale } from '@/lib/i18n';
import { SITE_URL } from '@/lib/schema';

/**
 * /sitemap.xml, built from the same data the pages are built from — so a new
 * solution, post or team member is listed the moment its page exists, and a
 * hidden one drops out with it.
 *
 * Each URL carries its hreflang twin when the twin exists (the same rule as
 * `alternates()` in lib/seo.ts: never point at a URL that 404s). English is
 * `x-default`, matching the pages' own <link rel="alternate"> tags.
 *
 * `lastModified` is set only where the data has a real date (blog posts).
 * Stamping every URL with the build time teaches Google to ignore the field.
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

type Row = { slug: string; hidden?: boolean };
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
  const postsEn = getPosts('en');
  const postsAr = getPosts('ar');

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

  const dates: Record<Locale, Map<string, string>> = {
    en: new Map(postsEn.map((p) => [`/blog/${p.slug}`, p.date])),
    ar: new Map(postsAr.map((p) => [`/blog/${p.slug}`, p.date])),
  };

  const abs = (locale: Locale, path: string) => `${SITE_URL}${localeHref(locale, path)}`;

  const entry = (locale: Locale, path: string): MetadataRoute.Sitemap[number] => {
    const languages: Record<string, string> = {};
    if (has.en.has(path)) languages.en = abs('en', path);
    if (has.ar.has(path)) languages.ar = abs('ar', path);
    if (has.en.has(path)) languages['x-default'] = abs('en', path);
    const date = dates[locale].get(path);
    return {
      url: abs(locale, path),
      ...(date ? { lastModified: date } : {}),
      // A lone language needs no alternates block.
      ...(Object.keys(languages).length > 2 ? { alternates: { languages } } : {}),
    };
  };

  // De-duplicated in case a slug appears twice in a dataset.
  const unique = (list: string[]) => Array.from(new Set(list));
  return [
    ...unique(paths.en).map((path) => entry('en', path)),
    ...unique(paths.ar).map((path) => entry('ar', path)),
  ];
}
