import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { getDict, getPosts, localeHref } from '@/lib/i18n';
import { alternates } from '@/lib/seo';

const locale = 'ar' as const;
const t = getDict(locale);
const posts = getPosts(locale);

export const metadata: Metadata = {
  alternates: alternates('ar', '/blog'), title: t('page.blog.title'), description: t('page.blog.lede') };

export const revalidate = 60;

/**
 * The Arabic blog index.
 *
 * The posts are Arabic now: src/data/posts.ar.json carries the same three
 * slugs, so a card here opens /ar/blog/<slug> and the switcher round-trips on
 * a post the way it does on every other page. The cards no longer carry
 * `lang="en"`, and the notice that used to sit above them explaining that the
 * articles were English is gone with the reason for it.
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
          <div className="index-grid">
            {posts.map((post, i) => (
              <Reveal as="article" key={post.slug} delay={i * 0.06}>
                <Link href={localeHref(locale, `/blog/${post.slug}`)} className="index-card post-card h-full">
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
