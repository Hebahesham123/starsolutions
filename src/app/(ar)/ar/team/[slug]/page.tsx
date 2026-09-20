import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EntryPage } from '@/components/EntryPage';
import { getContent, getDict, localeHref } from '@/lib/i18n';
import { alternates } from '@/lib/seo';

const locale = 'ar' as const;
const t = getDict(locale);

/** The Arabic dataset, not the loader — see the note at the top of any Arabic
 *  index page. Hidden rows are dropped here too, so a hidden entry has no
 *  route rather than an unlinked one. */
const items = () => getContent(locale).team.filter((entry) => !entry.hidden);

export const revalidate = 60;

export function generateStaticParams() {
  return items().map((item) => ({ slug: item.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const item = items().find((entry) => entry.slug === params.slug);
  const inEn = getContent('en').team.some((entry) => entry.slug === params.slug);
  return { alternates: alternates('ar', `/team/${params.slug}`, { en: inEn }), title: item?.title ??  t('page.team.title'), description: item?.summary };
}

export default function TeamDetailPage({ params }: { params: { slug: string } }) {
  const list = items();
  const index = list.findIndex((entry) => entry.slug === params.slug);
  if (index === -1) notFound();

  return (
    <EntryPage
      locale={locale}
      entry={list[index]}
      section={"الفريق"}
      sectionHref={localeHref(locale, '/team')}
      prev={list[index - 1] ?? null}
      next={list[index + 1] ?? null}
      pointsTitle={t('team.skills')}
      pointsAs="chips"
    />
  );
}
