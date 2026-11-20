import { getAutomations, getSolutions, getSystems } from './content';
import { getContent, getDict, localeHref, type Locale } from './i18n';
import { SERVICE_SECTIONS, type ServiceSection } from './post-utils';
import type { Entry } from './types';
import type { ServiceLookup } from '@/components/PostBody';

const GROUP_KEY: Record<ServiceSection, string> = {
  solutions: 'search.group.solution',
  automations: 'search.group.automation',
  systems: 'search.group.system',
};

/**
 * Our solution, automation and system pages in one language, keyed
 * "<section>/<slug>": what a post's callout cards and "Related services" link
 * to. English from the same loaders the pages use, Arabic from site.ar.json,
 * hidden entries left out — so a card never points at a page that 404s.
 */
export async function serviceLookup(locale: Locale): Promise<ServiceLookup> {
  const t = getDict(locale);
  const ar = locale === 'ar' ? getContent('ar') : null;
  const [solutions, automations, systems]: Entry[][] = ar
    ? [ar.solutions, ar.automations, ar.systems]
    : await Promise.all([getSolutions(), getAutomations(), getSystems()]);
  const lists: Record<ServiceSection, Entry[]> = { solutions, automations, systems };
  const out: ServiceLookup = {};
  for (const section of SERVICE_SECTIONS) {
    for (const e of lists[section].filter((x) => !x.hidden)) {
      out[`${section}/${e.slug}`] = {
        href: localeHref(locale, `/${section}/${e.slug}`),
        title: e.title,
        summary: e.short ?? e.summary,
        group: t(GROUP_KEY[section]),
      };
    }
  }
  return out;
}
