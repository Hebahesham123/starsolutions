import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { getDict, getPosts, localeHref } from '@/lib/i18n';
import { alternates } from '@/lib/seo';

const locale = 'ar' as const;
const t = getDict(locale);
const posts = getPosts(locale);

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = posts.find((p) => p.slug === params.slug);
  return {
    alternates: alternates(locale, `/blog/${params.slug}`),
    title: post?.title ?? t('page.blog.title'),
    description: post?.excerpt,
  };
}

export default function ArabicPostPage({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  return (
    <>
      <PageHead
        eyebrow={`${post.tag} · ${post.readingTime}`}
        title={post.title}
        lede={post.excerpt}
        crumbs={[
          { href: localeHref(locale, '/'), label: t('crumbs.home') },
          { href: localeHref(locale, '/blog'), label: t('page.blog.crumb') },
          { label: post.tag },
        ]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="detail-layout">
            <div className="detail-body">
              <Reveal>
                {post.body.map((para) => (
                  <p key={para.slice(0, 24)} className="section-sub" style={{ fontSize: '15.5px', marginTop: '14px' }}>{para}</p>
                ))}
              </Reveal>
            </div>
            <aside className="detail-aside">
              <h2>{t('post.asideTitle')}</h2>
              <p>{t('post.asideBody')}</p>
              <Link href={localeHref(locale, '/contact')} className="btn btn-primary btn-lg">{t('cta.audit')}</Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
