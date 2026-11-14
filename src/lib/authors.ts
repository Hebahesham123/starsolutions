import { getTeam } from '@/lib/content';
import { getContent, getPosts, localeHref, type Locale, type Post } from '@/lib/i18n';
import { abs } from '@/lib/schema';
import type { Entry } from '@/lib/types';

export type Author = {
  slug: string;
  name: string;
  role?: string;
  initials?: string;
  tone?: string;
  /** A photo in /public, if the team entry has one. */
  image?: string;
  /** The author's team page in this locale. */
  href: string;
  /** Same @id as the Person on their team page's ProfilePage. */
  personId: string;
};

/**
 * The team, from the same place each team page reads it: the Supabase table
 * (with the JSON fallback) in English, site.ar.json in Arabic. So a byline and
 * the page it links to always show the same name.
 */
async function team(locale: Locale): Promise<Entry[]> {
  return locale === 'ar' ? getContent('ar').team : getTeam();
}

/** The post's author, from the team data, or null if it has none. */
export async function postAuthor(post: Post, locale: Locale): Promise<Author | null> {
  if (!post.author) return null;
  const member = (await team(locale)).find((m) => m.slug === post.author && !m.hidden);
  if (!member) return null;
  const path = `/team/${member.slug}`;
  return {
    slug: member.slug,
    name: member.title,
    role: member.role,
    initials: member.initials,
    tone: member.tone,
    image: member.image,
    href: localeHref(locale, path),
    personId: `${abs(localeHref('en', path))}#person`,
  };
}

/** The posts a team member wrote, in the file's order (newest first). */
export function postsBy(slug: string, locale: Locale): Post[] {
  return getPosts(locale).filter((p) => p.author === slug);
}
