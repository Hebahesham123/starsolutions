import type { Metadata } from 'next';
import { PageHead } from '@/components/PageHead';
import { Process, NightPanel } from '@/components/sections';
import { CTA } from '@/components/CTA';
import { getContent, getDict, localeHref } from '@/lib/i18n';
import { alternates } from '@/lib/seo';

const locale = 'ar' as const;
const t = getDict(locale);

export const metadata: Metadata = {
  alternates: alternates('ar', '/process'), title: t('page.process.title'), description: t('page.process.lede') };

export const revalidate = 60;

export default function ArabicProcessPage() {
  const c = getContent(locale);
  return (
    <>
      <PageHead
        eyebrow={t('page.process.eyebrow')}
        title={t('page.process.title')}
        lede={t('page.process.lede')}
        crumbs={[{ href: localeHref(locale, '/'), label: t('crumbs.home') }, { label: t('page.process.crumb') }]}
      />
      {/* bare: the page head above already states the same eyebrow and title. */}
      <Process locale={locale} steps={c.process} bare />
      <NightPanel locale={locale} log={c.nightLog} stats={c.nightStats} heading="h2" />
      <CTA locale={locale} />
    </>
  );
}
