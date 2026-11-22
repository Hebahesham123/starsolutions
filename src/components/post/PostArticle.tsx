import Image from 'next/image';
import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { Faq } from '@/components/Faq';
import { Byline } from '@/components/Byline';
import { InlineMd, PostBody, type ServiceLookup } from '@/components/PostBody';
import type { Author } from '@/lib/authors';
import type { BlogPost } from '@/lib/posts';
import { bodyHeadings, checkExtraJsonLd } from '@/lib/post-utils';
import { getDict, localeHref, type Locale } from '@/lib/i18n';
import { JsonLd, abs, blogPosting } from '@/lib/schema';

/**
 * The standard blog post. Blocks in this order, each only when it has content:
 *
 *  1. Breadcrumbs (Home › Blog › Post) + BreadcrumbList   — PageHead
 *  2. H1 + subtitle                                        — PageHead
 *  3. Author (→ team page), published, updated, read time  — Byline + eyebrow
 *  4. Cover image with its alt text
 *  5. "Short answer in 30 seconds" (above the contents list)
 *  6. Table of contents from the H2s (per-post toggle)
 *  7. Body: Markdown + callout / video / gallery / inline CTA blocks
 *  8. FAQ + FAQPage                                        — Faq
 *  9. Sources
 * 10. CTA block (custom per post, default free audit) + WhatsApp
 * 11. Share: WhatsApp, LinkedIn, Facebook
 * 12. Related services, 3 related articles, previous / next
 *
 * Plus BlogPosting and any validated extra JSON-LD. Server-rendered, no
 * client JavaScript of its own: the TOC is a <details>, share buttons are
 * links, videos load nothing until played, and every image has its width and
 * height, so the layout never shifts.
 */
export function PostArticle({
  post, locale, author, services, related, prev, next, whatsapp,
}: {
  post: BlogPost;
  locale: Locale;
  author: Author | null;
  services: ServiceLookup;
  related: BlogPost[];
  prev: BlogPost | null;
  next: BlogPost | null;
  whatsapp: string;
}) {
  const t = getDict(locale);
  const path = `/blog/${post.slug}`;
  const pageUrl = abs(localeHref(locale, path));
  const blogHref = localeHref(locale, '/blog');
  const contactHref = localeHref(locale, '/contact');

  const toc = [
    ...bodyHeadings(post.body),
    ...(post.faq.length ? [{ id: 'faqTitle', text: post.faqTitle || t('detail.faq') }] : []),
    ...(post.sources.length ? [{ id: 'sources', text: t('post.sources') }] : []),
  ];
  const relatedServices = post.relatedServices.map((s) => services[`${s.section}/${s.slug}`]).filter(Boolean);
  const extra = post.seo.extraJsonLd && !checkExtraJsonLd(post.seo.extraJsonLd) ? JSON.parse(post.seo.extraJsonLd) : null;
  const share = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${post.title} ${pageUrl}`)}`, icon: 'whatsapp' },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}` },
  ];

  return (
    <>
      <PageHead
        eyebrow={[post.category, post.readingTime].filter(Boolean).join(' · ')}
        title={post.title}
        byline={<Byline author={author} locale={locale} published={post.date} updated={post.updated} />}
        lede={post.subtitle || undefined}
        crumbs={[
          { href: localeHref(locale, '/'), label: t('crumbs.home') },
          { href: blogHref, label: t('page.blog.crumb') },
          { label: post.title },
        ]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="detail-layout">
            <article className="detail-body post-article">
              <Reveal eager fade={false}>
                {post.cover && (
                  <figure className="post-cover">
                    <Image
                      src={post.cover.src}
                      alt={post.coverAlt}
                      width={post.cover.width}
                      height={post.cover.height}
                      sizes="(min-width: 1024px) 720px, 100vw"
                      loading="eager"
                    />
                  </figure>
                )}

                {/* The short answer first, right under the head: the reader
                    gets it before the contents list. */}
                {post.summary.length > 0 && (
                  <aside className="post-summary" aria-labelledby="postSummaryTitle">
                    <p id="postSummaryTitle" className="post-summary-title"><Icon name="clock" /> {t('post.summary')}</p>
                    <ul>
                      {post.summary.map((s) => <li key={s}><InlineMd text={s} locale={locale} path={path} /></li>)}
                    </ul>
                  </aside>
                )}

                {post.showToc && toc.length >= 2 && (
                  <details className="post-toc" open>
                    <summary>{t('post.toc')}</summary>
                    <ol>
                      {toc.map((h) => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}
                    </ol>
                  </details>
                )}

                <PostBody body={post.body} locale={locale} path={path} services={services} whatsapp={whatsapp} />
              </Reveal>

              {post.faq.length > 0 && (
                <div className="post-md">
                  <Faq items={post.faq} locale={locale} path={path} embedded title={post.faqTitle} />
                </div>
              )}

              {post.sources.length > 0 && (
                <section className="post-sources" aria-labelledby="sources">
                  <h2 id="sources">{t('post.sources')}</h2>
                  <ol>
                    {post.sources.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} rel="noopener noreferrer nofollow" target="_blank">{s.title}</a>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              <section className="post-cta-block" aria-labelledby="postCtaTitle">
                <h2 id="postCtaTitle">{post.cta.heading || t('post.asideTitle')}</h2>
                {post.cta.text
                  ? <PostBody body={post.cta.text} locale={locale} path={path} services={services} whatsapp={whatsapp} />
                  : <p className="post-cta-text">{t('post.asideBody')}</p>}
                <div className="post-cta-actions">
                  <Link href={post.cta.button_label ? post.cta.button_href || contactHref : contactHref} className="btn btn-primary btn-lg">
                    {post.cta.button_label || t('cta.audit')}
                  </Link>
                  <a href={whatsapp} className="btn btn-ghost btn-lg" rel="noopener noreferrer" target="_blank">
                    <Icon name="whatsapp" className="h-5 w-5 text-[#25D366]" /> WhatsApp
                  </a>
                </div>
              </section>

              <nav className="post-share" aria-label={t('post.share')}>
                <span className="post-share-label">{t('post.share')}</span>
                {share.map((s) => (
                  <a key={s.label} href={s.href} className="post-share-btn" rel="noopener noreferrer" target="_blank">
                    {s.icon && <Icon name={s.icon} />} {s.label}
                  </a>
                ))}
              </nav>

              {relatedServices.length > 0 && (
                <section className="post-related" aria-labelledby="relatedServicesTitle">
                  <h2 id="relatedServicesTitle">{t('post.relatedServices')}</h2>
                  <ul className="post-related-services">
                    {relatedServices.map((s) => (
                      <li key={s.href}>
                        <Link href={s.href}>
                          <span className="post-callout-group">{s.group}</span>
                          <span className="post-related-name">{s.title}</span>
                          <Icon name="arrow" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {related.length > 0 && (
                <section className="post-related" aria-labelledby="relatedPostsTitle">
                  <h2 id="relatedPostsTitle">{t('post.relatedPosts')}</h2>
                  <div className="post-related-posts">
                    {related.map((p) => (
                      <Link key={p.slug} href={localeHref(locale, `/blog/${p.slug}`)} className="index-card post-card">
                        <p className="post-meta">{[p.category, p.readingTime].filter(Boolean).join(' · ')}</p>
                        <h3>{p.title}</h3>
                        {p.subtitle && <p>{p.subtitle}</p>}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {(prev || next) && (
                <nav className="post-pager" aria-label={`${t('post.prev')} / ${t('post.next')}`}>
                  {prev ? (
                    <Link href={localeHref(locale, `/blog/${prev.slug}`)} rel="prev" className="post-pager-link">
                      <span className="post-pager-dir"><Icon name="left" /> {t('post.prev')}</span>
                      <span className="post-pager-title">{prev.title}</span>
                    </Link>
                  ) : <span />}
                  {next ? (
                    <Link href={localeHref(locale, `/blog/${next.slug}`)} rel="next" className="post-pager-link is-next">
                      <span className="post-pager-dir">{t('post.next')} <Icon name="right" /></span>
                      <span className="post-pager-title">{next.title}</span>
                    </Link>
                  ) : <span />}
                </nav>
              )}
            </article>
            <aside className="detail-aside">
              <h2>{t('post.asideTitle')}</h2>
              <p>{t('post.asideBody')}</p>
              <Link href={contactHref} className="btn btn-primary btn-lg">{t('cta.audit')}</Link>
            </aside>
          </div>
        </div>
      </section>
      <JsonLd data={blogPosting(post, locale, path, author)} />
      {extra && <JsonLd data={extra} />}
    </>
  );
}
