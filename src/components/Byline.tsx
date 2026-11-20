import Link from 'next/link';
import type { Author } from '@/lib/authors';
import { cairoDateOf, cairoInstantIso, cairoIso, formatDate } from '@/lib/dates';
import { getDict, type Locale } from '@/lib/i18n';

/**
 * The line under a post title: "By <name>" linking to the author's team page,
 * their role, the published date and the "Updated" date.
 *
 * Shows the team member's photo when their entry has one, otherwise the same
 * initials badge the team cards use. Both are a fixed 30px, so nothing moves
 * when the page loads.
 */
export function Byline({ author, locale, published, updated }: {
  author?: Author | null;
  locale: Locale;
  /** "YYYY-MM-DD", datePublished. */
  published?: string;
  /** ISO timestamp of the last content change. Shown only when it is a later day than `published`. */
  updated?: string;
}) {
  const t = getDict(locale);
  const updatedDay = updated ? cairoDateOf(updated) : undefined;
  const showUpdated = updated && updatedDay && (!published || updatedDay > published);
  if (!author && !published && !showUpdated) return null;
  return (
    <p className="post-byline">
      {author && (
        <Link href={author.href} className="post-byline-link">
          {author.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.image} alt="" width={30} height={30} className="post-byline-photo" />
          ) : (
            <span className="avatar post-byline-avatar" style={{ ['--a1' as string]: author.tone ?? 'var(--brand)' }} aria-hidden="true">
              {author.initials}
            </span>
          )}
          <span>
            {t('post.by')} <strong>{author.name}</strong>
          </span>
        </Link>
      )}
      {author?.role && <span className="post-byline-role">{author.role}</span>}
      {published && (
        <span className="post-byline-updated">
          {t('post.published')} <time dateTime={cairoIso(published)}>{formatDate(published, locale)}</time>
        </span>
      )}
      {showUpdated && (
        <span className="post-byline-updated">
          {t('post.updated')} <time dateTime={cairoInstantIso(updated)}>{formatDate(updatedDay, locale)}</time>
        </span>
      )}
    </p>
  );
}
