import type { Metadata } from 'next';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { PostArticle } from './PostArticle';
import { postAuthor } from '@/lib/authors';
import { getContent, getDict, localeHref, type Locale } from '@/lib/i18n';
import { adjacentPosts, getPost, getPosts, missingPost, relatedPosts } from '@/lib/posts';
import { serviceLookup } from '@/lib/post-services';
import { postMetadata } from '@/lib/post-seo';

/**
 * /blog/[slug] and /ar/blog/[slug] are this file with a different locale.
 */

export async function postStaticParams(locale: Locale) {
  return (await getPosts(locale)).map((p) => ({ slug: p.slug }));
}

export async function postPageMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const post = await getPost(locale, slug);
  return post ? postMetadata(post) : { title: getDict(locale)('page.blog.title') };
}

/** The page: the post, or a redirect (no translation → blog index; old slug → new), or 404. */
export async function PostPage({ locale, slug }: { locale: Locale; slug: string }) {
  const post = await getPost(locale, slug);
  if (!post) {
    const missing = await missingPost(locale, slug);
    if (missing?.kind === 'index') redirect(localeHref(locale, '/blog'));
    if (missing?.kind === 'moved') permanentRedirect(localeHref(locale, `/blog/${missing.slug}`));
    notFound();
  }
  const [author, all, services] = await Promise.all([postAuthor(post, locale), getPosts(locale), serviceLookup(locale)]);
  const { prev, next } = adjacentPosts(post, all);
  return (
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
  );
}
