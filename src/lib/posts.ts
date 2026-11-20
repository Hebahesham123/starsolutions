import { cache } from 'react';
import { getSupabase } from './supabase';
import { legacyRows } from './posts-legacy';
import { cairoDateOf } from './dates';
import {
  isLive, normalizeRow, postWords, readingLabel, readingMinutes,
  type Lang, type PostCta, type PostFaq, type PostImage, type PostRow, type PostSource, type ServiceRef,
} from './post-utils';

/**
 * Blog posts, for every public surface: the post pages, the blog indexes, the
 * sitemap, team pages, the API and the agents. One rule everywhere — a post
 * appears in a language only when it is live (published, or scheduled and its
 * time has passed) and that language is enabled. Drafts and future posts never
 * leave this file; the database policy on public.posts enforces the same rule
 * a second time, so even a bug here could not leak one.
 *
 * Source: the Supabase `posts` table. If Supabase is not configured, or the
 * table cannot be read (not created yet, or the query failed), the three
 * original posts from src/data/posts*.json are served instead, converted by
 * the same code that wrote the seed SQL. An empty table is not a failure: it
 * is an empty blog.
 */

/** One language of a live post, ready to render. */
export type BlogPost = {
  slug: string;
  locale: Lang;
  title: string;
  subtitle: string;
  category: string;
  summary: string[];
  body: string;
  faqTitle?: string;
  faq: PostFaq[];
  sources: PostSource[];
  cta: PostCta;
  cover: PostImage | null;
  coverAlt: string;
  tags: string[];
  /** Team member slug. */
  author?: string;
  relatedServices: ServiceRef[];
  showToc: boolean;
  /** "YYYY-MM-DD", datePublished. */
  date: string;
  /** ISO timestamp of the last content change, dateModified. */
  updated?: string;
  words: number;
  readingTime: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    canonical: string;
    noindex: boolean;
    ogTitle: string;
    ogDescription: string;
    ogImage: PostImage | null;
    extraJsonLd: string;
  };
  /** Which languages this article is live in. */
  translations: Record<Lang, boolean>;
};

/** A row's language version as a BlogPost. Used for live rows and for the admin preview. */
export function toBlogPost(row: PostRow, locale: Lang): BlogPost {
  const l = row[locale];
  const words = postWords(l);
  const date = row.published_on
    ?? (row.publish_at ? cairoDateOf(row.publish_at) : cairoDateOf(row.created_at ?? new Date().toISOString()));
  return {
    slug: row.slug,
    locale,
    title: l.title,
    subtitle: l.subtitle,
    category: l.category,
    summary: l.summary,
    body: l.body,
    faqTitle: l.faq_title,
    faq: l.faq,
    sources: l.sources,
    cta: l.cta,
    cover: row.cover,
    coverAlt: l.cover_alt,
    tags: row.tags,
    author: row.author_slug ?? undefined,
    relatedServices: row.related_services,
    showToc: row.show_toc,
    date,
    updated: row.content_updated_at ?? undefined,
    words,
    readingTime: readingLabel(readingMinutes(words), locale),
    seo: {
      metaTitle: l.meta_title,
      metaDescription: l.meta_description,
      focusKeyword: l.focus_keyword,
      canonical: l.canonical,
      noindex: l.noindex,
      ogTitle: l.og_title,
      ogDescription: l.og_description,
      ogImage: l.og_image,
      extraJsonLd: l.extra_jsonld,
    },
    translations: { en: hasLang(row, 'en'), ar: hasLang(row, 'ar') },
  };
}

const hasLang = (row: PostRow, locale: Lang) => row[`${locale}_enabled`] && !!row[locale].title.trim();

/** Newest first: published date, then publish time, then slug for a stable order. */
function byDate(a: PostRow, b: PostRow) {
  const d = (b.published_on ?? '').localeCompare(a.published_on ?? '');
  if (d) return d;
  const t = (b.publish_at ?? '').localeCompare(a.publish_at ?? '');
  return t || a.slug.localeCompare(b.slug);
}

async function loadRows(): Promise<PostRow[]> {
  const fallback = () => legacyRows();
  const db = getSupabase();
  if (!db) return fallback();
  try {
    const { data, error } = await db.from('posts').select('*');
    if (error || !data) return fallback();
    return (data as Record<string, unknown>[]).map(normalizeRow);
  } catch {
    return fallback();
  }
}

/** Every live row, newest first. Once per request. */
export const getLiveRows = cache(async (): Promise<PostRow[]> => {
  const now = Date.now();
  return (await loadRows()).filter((r) => isLive(r, now)).sort(byDate);
});

/** The live posts in one language, newest first. */
export async function getPosts(locale: Lang): Promise<BlogPost[]> {
  return (await getLiveRows()).filter((r) => hasLang(r, locale)).map((r) => toBlogPost(r, locale));
}

export async function getPost(locale: Lang, slug: string): Promise<BlogPost | null> {
  return (await getPosts(locale)).find((p) => p.slug === slug) ?? null;
}

/**
 * What to do with a /blog/<slug> request that is not a live post in this
 * language:
 *  - the article is live only in the other language → this language's blog
 *    index (so the header's language switch, which swaps the /ar prefix,
 *    lands on the index when there is no translation);
 *  - the slug is an old one of a live post → that post's current URL (308);
 *  - otherwise null, and the page 404s.
 */
export async function missingPost(locale: Lang, slug: string): Promise<{ kind: 'index' } | { kind: 'moved'; slug: string } | null> {
  const rows = await getLiveRows();
  const row = rows.find((r) => r.slug === slug);
  if (row) return hasLang(row, locale) ? null : { kind: 'index' };
  const moved = rows.find((r) => r.previous_slugs.includes(slug));
  if (moved && hasLang(moved, locale)) return { kind: 'moved', slug: moved.slug };
  return null;
}

/** Up to `count` posts to read next: same category first, then shared tags, then newest. */
export function relatedPosts(post: BlogPost, all: BlogPost[], count = 3): BlogPost[] {
  const score = (p: BlogPost) =>
    (post.category && p.category === post.category ? 2 : 0) + p.tags.filter((t) => post.tags.includes(t)).length;
  return all
    .filter((p) => p.slug !== post.slug)
    .map((p, i) => ({ p, s: score(p), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, count)
    .map((x) => x.p);
}

/** The neighbours in date order: `prev` is the older post, `next` the newer one. */
export function adjacentPosts(post: BlogPost, all: BlogPost[]) {
  const i = all.findIndex((p) => p.slug === post.slug);
  return { prev: i >= 0 ? all[i + 1] ?? null : null, next: i > 0 ? all[i - 1] : null };
}

/** Last content change of a post, for the sitemap. */
export const postLastmod = (p: BlogPost) => p.updated ?? p.date;
