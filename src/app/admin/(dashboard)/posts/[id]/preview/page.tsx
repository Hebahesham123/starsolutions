import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostArticle } from '@/components/post/PostArticle';
import { rscSupabase } from '@/lib/admin/session';
import { postAuthor } from '@/lib/authors';
import { getContent } from '@/lib/i18n';
import { serviceLookup } from '@/lib/post-services';
import { adjacentPosts, getPosts, relatedPosts, toBlogPost } from '@/lib/posts';
import { normalizeRow, type Lang } from '@/lib/post-utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Preview', robots: { index: false, follow: false } };

/**
 * The saved version of a post (draft or not) through the real template,
 * inside the dashboard so only admins can open it.
 */
export default async function PostPreviewPage({ params, searchParams }: { params: { id: string }; searchParams: { lang?: string } }) {
  const locale: Lang = searchParams.lang === 'ar' ? 'ar' : 'en';
  const { data } = await rscSupabase().from('posts').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const post = toBlogPost(normalizeRow(data), locale);
  const [author, all, services] = await Promise.all([postAuthor(post, locale), getPosts(locale), serviceLookup(locale)]);
  const { prev, next } = adjacentPosts(post, all);
  return (
    <div className="post-preview-page" dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
      <p className="admin-alert is-warn">Preview of the saved version ({locale.toUpperCase()}). Unsaved edits are not shown.</p>
      <PostArticle
        post={post}
        locale={locale}
        author={author}
        services={services}
        related={relatedPosts(post, all)}
        prev={prev}
        next={next}
        whatsapp={getContent(locale).contact.whatsapp}
      />
    </div>
  );
}
