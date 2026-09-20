import type { Metadata } from 'next';
import { PageHead } from '@/components/PageHead';
import { Team, Testimonials } from '@/components/sections';
import { CTA } from '@/components/CTA';
import { getContent, getDict, localeHref } from '@/lib/i18n';
import { alternates } from '@/lib/seo';

const locale = 'ar' as const;
const t = getDict(locale);

export const metadata: Metadata = {
  alternates: alternates('ar', '/about'), title: t('page.about.title'), description: t('page.about.lede') };

export const revalidate = 60;

export default function ArabicAboutPage() {
  const c = getContent(locale);
  return (
    <>
      <PageHead
        eyebrow={t('page.about.eyebrow')}
        title={t('page.about.title')}
        lede={t('page.about.lede')}
        crumbs={[{ href: localeHref(locale, '/'), label: t('crumbs.home') }, { label: t('page.about.crumb') }]}
      />
      <Team locale={locale} team={c.team.filter((m) => !m.hidden)} />
      <Testimonials locale={locale} items={c.testimonials} />
      <CTA locale={locale} />
    </>
  );
}
