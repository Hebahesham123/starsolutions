import { allEntries, getProjects, site } from '@/lib/content';
import { getContent, getDict, localeHref, type Locale } from '@/lib/i18n';
import type { SearchDoc } from './SiteSearch';

/** The fixed pages, which have no rows behind them. `key` names the string to
 *  translate the title with; the English titles below are the fallback. */
const PAGES: (SearchDoc & { key: string })[] = [
  { key: 'home', href: '/', title: 'Home', group: 'Page', terms: 'start homepage overview' },
  { key: 'solutions', href: '/solutions', title: 'Solutions', group: 'Page', terms: 'services what we do suite' },
  { key: 'results', href: '/results', title: 'Results', group: 'Page', terms: 'numbers proof stats roas revenue' },
  { key: 'process', href: '/process', title: 'How it works', group: 'Page', terms: 'process steps onboarding timeline' },
  { key: 'work', href: '/work', title: 'Our work', group: 'Page', terms: 'portfolio projects websites builds' },
  { key: 'caseStudies', href: '/case-studies', title: 'Case studies', group: 'Page', terms: 'clients stories before after' },
  { key: 'systems', href: '/systems', title: 'Systems', group: 'Page', terms: 'dashboards internal tools' },
  { key: 'automations', href: '/automations', title: 'Automations', group: 'Page', terms: 'ai integrations workflows n8n' },
  { key: 'goals', href: '/goals', title: 'Goals', group: 'Page', terms: 'objectives outcomes' },
  { key: 'team', href: '/team', title: 'Team', group: 'Page', terms: 'people about us staff' },
  { key: 'blog', href: '/blog', title: 'Blog', group: 'Page', terms: 'articles writing insights' },
  { key: 'about', href: '/about', title: 'About', group: 'Page', terms: 'company who we are' },
  { key: 'contact', href: '/contact', title: 'Contact', group: 'Page', terms: 'get in touch audit email phone whatsapp' },
];

/**
 * Everything the header search can find.
 *
 * Built on the server and handed to the client as a prop: it is a few dozen
 * titles, so shipping it costs less than the round trip a query would need, and
 * the panel filters with no network at all.
 *
 * It reads the same getters the pages do, so an entry hidden from the site is
 * hidden from search too — visible() has already run by the time these return.
 * A result pointing at a 404 is worse than no result.
 */
export async function buildSearchIndex(locale: Locale = 'en'): Promise<SearchDoc[]> {
  /* Arabic reads the bundled dataset rather than the loader. The loader is
     Supabase-with-fallback and English-only, so an Arabic index built from it
     would list English titles under Arabic URLs. Everything here is already a
     plain array either way, so the two paths differ only in where the rows
     come from. */
  const ar = locale === 'ar' ? getContent('ar') : null;
  const t = getDict(locale);
  const [entries, enProjects] = await Promise.all([allEntries(), getProjects()]);
  const { solutions, goals, caseStudies, systems, automations, team } = ar
    ? {
        solutions: ar.solutions, goals: ar.goals, caseStudies: ar.caseStudies,
        systems: ar.systems, automations: ar.automations, team: ar.team,
      }
    : entries;
  const projects = ar ? ar.projects : enProjects;
  const platforms = ar ? ar.platforms : site.platforms;

  const from = (rows: { slug: string; title: string; short?: string; summary?: string }[], base: string, group: string) =>
    rows.map((r) => ({
      href: localeHref(locale, `${base}/${r.slug}`),
      title: r.title,
      group,
      sub: r.short ?? r.summary,
    }));

  return [
    ...PAGES.map(({ key, ...page }) => ({
      ...page,
      href: localeHref(locale, page.href),
      title: locale === 'en' ? page.title : t(`search.page.${key}`),
    })),
    ...from(solutions, '/solutions', t('search.group.solution')),
    ...from(goals, '/goals', t('search.group.goal')),
    ...from(systems, '/systems', t('search.group.system')),
    ...from(automations, '/automations', t('search.group.automation')),
    ...from(caseStudies, '/case-studies', t('search.group.case')),
    ...from(team, '/team', t('search.group.team')),
    ...projects.map((p) => ({
      href: localeHref(locale, `/work/${p.slug}`),
      title: p.title,
      group: t('search.group.project'),
      sub: p.short,
      terms: p.badge,
    })),
    ...platforms.map((name) => ({
      // Platform names are what people actually type — "shopify", "whatsapp" —
      // and the automations page is where those live.
      href: localeHref(locale, '/automations'),
      title: name,
      group: t('search.group.platform'),
      sub: t('search.platformSub'),
      terms: 'platform integration tool',
    })),
  ];
}
