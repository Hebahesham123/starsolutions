import type { Metadata } from 'next';
import { PageHead } from '@/components/PageHead';
import { ResultsPanel } from '@/components/ResultsPanel';
import { CaseCard } from '@/components/sections';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { getContent, getDict, localeHref } from '@/lib/i18n';
import { alternates } from '@/lib/seo';

const locale = 'ar' as const;
const t = getDict(locale);

export const metadata: Metadata = {
  alternates: alternates(locale, '/results'),
  title: t('page.results.title'),
  description: t('page.results.lede'),
};

export const revalidate = 60;

export default function ArabicResultsPage() {
  const c = getContent(locale);
  const cases = c.caseStudies.filter((x) => !x.hidden);
  return (
    <>
      <PageHead
        eyebrow={t('page.results.eyebrow')}
        title={t('page.results.title')}
        lede={t('page.results.lede')}
        crumbs={[{ href: localeHref(locale, '/'), label: t('crumbs.home') }, { label: t('page.results.crumb') }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <ResultsPanel locale={locale} charts={c.charts} figures={c.figures} />

          <h2 className="group-label mt-10">{t('results.whereFrom')}</h2>
          <div className="index-grid">
            {cases.map((x, i) => (
              <Reveal key={x.id} delay={i * 0.05}><CaseCard locale={locale} c={x} /></Reveal>
            ))}
          </div>

          <h2 className="group-label mt-10">{t('results.inTheirWords')}</h2>
          <div className="index-grid">
            {c.testimonials.map((r, i) => (
              <Reveal as="figure" key={r.id} className="review w-full" delay={i * 0.04}>
                <Icon name="quote" className="rq" />
                <blockquote>{r.quote}</blockquote>
                <figcaption>
                  <span className="avatar" style={{ ['--a1' as string]: r.tone }}>{r.initials}</span>
                  <span><strong>{r.name}</strong>{r.role}</span>
                </figcaption>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
