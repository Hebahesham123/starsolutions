import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import posts from '@/data/posts.json';
import { getDict, localeHref } from '@/lib/i18n';
import { alternates } from '@/lib/seo';

const locale = 'ar' as const;
const t = getDict(locale);

export const metadata: Metadata = {
  alternates: alternates('ar', '/blog'), title: t('page.blog.title'), description: t('page.blog.lede') };

export const revalidate = 60;

/**
 * The Arabic blog index.
 *
 * The route exists so the language switcher round-trips and /ar/blog is not a
 * 404, but the posts themselves are English: src/data/posts.json has no Arabic
 * side, and translating long-form copy is out of scope here. Each card is
 * marked `lang="en"` so a screen reader switches voice on it rather than
 * reading English aloud in Arabic, and the posts link back into the English
 * routes, which is where they actually are.
 */
export default function ArabicBlogIndexPage() {
  return (
    <>
      <PageHead
        eyebrow={t('page.blog.eyebrow')}
        title={t('page.blog.title')}
        lede={t('page.blog.lede')}
        crumbs={[{ href: localeHref(locale, '/'), label: t('crumbs.home') }, { label: t('page.blog.crumb') }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <p className="section-sub mb-6">{t('blog.englishOnly')}</p>
          <div className="index-grid">
            {posts.map((post, i) => (
              <Reveal as="article" key={post.slug} delay={i * 0.06}>
                <Link href={`/blog/${post.slug}`} className="index-card post-card h-full" lang="en" dir="ltr">
                  <p className="post-meta">{post.tag} · {post.readingTime}</p>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <span className="index-more">{t('cta.readMore')} <Icon name="arrow" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
