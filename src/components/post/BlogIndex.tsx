import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { getPosts } from '@/lib/posts';
import { getDict, localeHref, type Locale } from '@/lib/i18n';

/**
 * /blog and /ar/blog: the live posts in that language, newest first. A post
 * that exists only in the other language is simply not listed here.
 */
export async function BlogIndex({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const posts = await getPosts(locale);
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
                  <p className="post-meta">{[post.category, post.readingTime].filter(Boolean).join(' · ')}</p>
                  <h2>{post.title}</h2>
                  <p>{post.subtitle}</p>
                  <span className="index-more">{locale === 'en' ? 'Read post' : t('cta.readMore')} <Icon name="arrow" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
