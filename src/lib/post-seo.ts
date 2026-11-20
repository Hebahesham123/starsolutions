import type { Metadata } from 'next';
import { cairoInstantIso, cairoIso } from './dates';
import type { BlogPost } from './posts';
import { alternates, withSeo } from './seo';

/** Everything in a post's <head>, from its own row — never from seo.json. */
export function postMetadata(post: BlogPost): Metadata {
  const locale = post.locale;
  const path = `/blog/${post.slug}`;
  // hreflang only when both languages are live; a single-language post lists none.
  const both = post.translations.en && post.translations.ar;
  const alt = alternates(locale, path);
  const canonical = post.seo.canonical.trim() || alt.canonical;
  const title = post.seo.metaTitle.trim();
  const description = post.seo.metaDescription.trim() || post.subtitle;
  const image = post.seo.ogImage ?? post.cover;

  const meta = withSeo(
    {
      alternates: { canonical: alt.canonical, ...(both ? { languages: alt.languages } : {}) },
      title: title ? { absolute: title } : post.title,
      description,
    },
    {
      copy: false,
      shareTitle: post.seo.ogTitle.trim() || title || undefined,
      shareDescription: post.seo.ogDescription.trim() || undefined,
      image: image ? { url: image.src, width: image.width, height: image.height } : undefined,
      imageAlt: image && image === post.cover ? post.coverAlt : undefined,
      url: canonical,
      article: {
        publishedTime: cairoIso(post.date),
        modifiedTime: post.updated ? cairoInstantIso(post.updated) : undefined,
      },
    },
  );
  return {
    ...meta,
    // A path resolves against metadataBase, exactly as every other page's does.
    alternates: { ...meta.alternates, canonical },
    ...(post.seo.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
