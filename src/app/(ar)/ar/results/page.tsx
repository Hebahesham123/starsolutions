import type { Metadata } from 'next';
import { PageHead } from '@/components/PageHead';
import { ResultsPanel } from '@/components/ResultsPanel';
import { CTA } from '@/components/CTA';
import { getContent, getDict, localeHref } from '@/lib/i18n';
import { alternates } from '@/lib/seo';

const locale = 'ar' as const;
const t = getDict(locale);

export const metadata: Metadata = {
  alternates: alternates('ar', '/results'), title: t('page.results.title'), description: t('page.results.lede') };

export const revalidate = 60;

export default function ArabicResultsPage() {
  const c = getContent(locale);
  return (
    <>
      <PageHead
        eyebrow={t('page.results.eyebrow')}
        title={t('page.results.title')}
        lede={t('page.results.lede')}
        crumbs={[{ href: localeHref(locale, '/'), label: t('crumbs.home') }, { label: t('page.results.crumb') }]}
      />
      <section className="section stats-section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <ResultsPanel locale={locale} charts={c.charts} figures={c.figures} />
        </div>
      </section>
      <CTA locale={locale} />
    </>
  );
}
