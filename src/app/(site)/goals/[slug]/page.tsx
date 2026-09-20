import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EntryPage } from '@/components/EntryPage';
import { getGoals } from '@/lib/content';
import { alternates } from '@/lib/seo';
import { getContent } from '@/lib/i18n';

export async function generateStaticParams() {
  const items = await getGoals();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const items = await getGoals();
  const item = items.find((entry) => entry.slug === params.slug);
  const inAr = getContent('ar').goals.some((entry) => entry.slug === params.slug);
  return { alternates: alternates('en', `/goals/${params.slug}`, { ar: inAr }), title: item?.title ??  'Business goals', description: item?.summary };
}

export default async function GoalsDetailPage({ params }: { params: { slug: string } }) {
  const items = await getGoals();
  const index = items.findIndex((entry) => entry.slug === params.slug);
  if (index === -1) notFound();

  return (
    <EntryPage
      entry={items[index]}
      section="Business goals"
      sectionHref="/goals"
      prev={items[index - 1] ?? null}
      next={items[index + 1] ?? null}
    />
  );
}
