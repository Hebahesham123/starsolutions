import Link from 'next/link';
import { Icon } from './Icon';
import { postsBy } from '@/lib/authors';
import { getDict, localeHref, type Locale } from '@/lib/i18n';

/**
 * "Articles by <name>" on a team page: the blog posts that person wrote.
 * Renders nothing for someone with no posts.
 */
export function AuthorPosts({ slug, name, locale = 'en' }: { slug: string; name: string; locale?: Locale }) {
  const posts = postsBy(slug, locale);
  if (posts.length === 0) return null;
  const t = getDict(locale);
  return (
    <section className="section author-posts" aria-labelledby="authorPostsTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <h2 id="authorPostsTitle" className="author-posts-title">{t('team.articlesBy')} {name}</h2>
        <ul className="author-posts-list">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={localeHref(locale, `/blog/${p.slug}`)}>
                <span className="author-posts-meta">{p.tag} · {p.readingTime}</span>
                <span className="author-posts-name">{p.title}</span>
                <Icon name="arrow" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
