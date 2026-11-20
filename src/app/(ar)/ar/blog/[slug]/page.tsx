import type { Metadata } from 'next';
import { PostPage, postPageMetadata, postStaticParams } from '@/components/post/PostPage';

const locale = 'ar' as const;

/* Posts come from the posts table. Rebuilt at most once a minute, and at once
   when a post is saved in /admin; slugs published after the build render on
   their first request. */
export const revalidate = 60;

export function generateStaticParams() {
  return postStaticParams(locale);
}

export function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return postPageMetadata(locale, params.slug);
}

export default function ArabicPostRoute({ params }: { params: { slug: string } }) {
  return <PostPage locale={locale} slug={params.slug} />;
}
