import { Hero } from '@/components/Hero';
import { ResultsPanel } from '@/components/ResultsPanel';
import { CTA } from '@/components/CTA';
import {
  SectionHead, Goals, Systems, Process, NightPanel, CaseStudies, Work, Automations,
  Testimonials, Team,
} from '@/components/sections';
import { getContent, getDict } from '@/lib/i18n';
import type { Metadata } from 'next';
import { alternates } from '@/lib/seo';

const locale = 'ar' as const;
const t = getDict(locale);

export const metadata: Metadata = { alternates: alternates('ar', '/') };

export const revalidate = 60;

/**
 * The Arabic home page.
 *
 * It mirrors the English one section for section, but reads site.ar.json
 * directly rather than the Supabase loader: that loader is English-only, so
 * going through it would put English rows under Arabic headings. Every section
 * takes the locale and looks its own chrome up from the dictionary.
 */
export default function ArabicHomePage() {
  const c = getContent(locale);
  const visible = <T extends { hidden?: boolean }>(rows: T[]) => rows.filter((row) => !row.hidden);

  return (
    <>
      <Hero locale={locale} nodes={c.heroNodes} stats={c.heroStats} platforms={c.platforms} />
      <Goals locale={locale} goals={visible(c.goals)} />
      <Process locale={locale} steps={c.process} />

      <section id="results" className="section section-soft stats-section" aria-labelledby="statsTitle">
        <div className="starfield starfield-dim" aria-hidden="true" />
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="section-head-card">
            <SectionHead
              id="statsTitle"
              eyebrow={t('results.eyebrow')}
              title={t('results.title')}
              sub={t('results.sub')}
            />
          </div>
          <ResultsPanel locale={locale} charts={c.charts} figures={c.figures} />
        </div>
      </section>

      <Systems locale={locale} systems={visible(c.systems)} />
      <NightPanel locale={locale} log={c.nightLog} stats={c.nightStats} />
      <CaseStudies locale={locale} cases={visible(c.caseStudies)} />
      <Work locale={locale} projects={visible(c.projects)} />
      <Automations locale={locale} automations={visible(c.automations)} platforms={c.platforms} />
      <Testimonials locale={locale} items={c.testimonials} />
      <Team locale={locale} team={visible(c.team)} />
      <CTA locale={locale} />
    </>
  );
}
