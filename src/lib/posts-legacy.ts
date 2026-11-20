/**
 * The three original posts, from src/data/posts.json / posts.ar.json, in the
 * shape of a public.posts row.
 *
 * Two users, so they can never disagree:
 *  - scripts/generate-posts-seed.mjs turns these rows into
 *    supabase/migrations/0006_posts_seed.sql;
 *  - lib/posts.ts serves them when Supabase is not configured or the posts
 *    table does not exist yet (local dev, or before 0005 has been run).
 *
 * The conversion keeps every word: the body up to the FAQ stays the body; the
 * FAQ section becomes question/answer pairs exactly as PostBody used to split
 * them (so the FAQPage schema is identical); anything after the FAQ becomes
 * the post's CTA block. Relative imports only: the seed script loads this file
 * outside Next.js.
 */
import postsEn from '../data/posts.json';
import postsAr from '../data/posts.ar.json';
import { parseMarkdown, splitFaq } from './markdown';
import { cairoIso } from './dates';
import { emptyLang, type PostLang, type PostRow } from './post-utils';

type LegacyPost = {
  slug: string; title: string; excerpt: string; date: string; updated?: string;
  tag: string; author?: string; seoTitle?: string; metaDescription?: string;
  cover?: { src: string; width: number; height: number };
  body: string | string[];
};

const FAQ_HEADINGS = ['Frequently asked questions', 'أسئلة شائعة'];
const bare = (s: string) => s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim();

/** Splits a Markdown body into what comes before the FAQ, the FAQ, and the section after it. */
export function splitLegacyBody(body: string) {
  const lines = body.replace(/\r\n?/g, '\n').split('\n');
  const start = lines.findIndex((l) => {
    const m = l.trim().match(/^##\s+(.*)$/);
    return !!m && FAQ_HEADINGS.includes(bare(m[1]));
  });
  if (start === -1) return { body: body.trim(), faqTitle: undefined, faq: [], cta: {} };

  let end = start + 1;
  while (end < lines.length && !/^##\s/.test(lines[end].trim()) && !/^-{3,}$/.test(lines[end].trim())) end++;

  const { title, faq } = splitFaq(parseMarkdown(lines.slice(start, end).join('\n')), FAQ_HEADINGS);
  const rest = lines.slice(end).join('\n').trim().replace(/^-{3,}\s*/, '');
  const head = rest.match(/^##\s+(.*)\n?([\s\S]*)$/);
  const cta = head ? { heading: head[1].trim(), text: head[2].trim() } : rest ? { text: rest } : {};
  return { body: lines.slice(0, start).join('\n').trim(), faqTitle: title, faq, cta };
}

function toLang(p: LegacyPost): PostLang {
  const body = Array.isArray(p.body) ? p.body.join('\n\n') : p.body;
  const split = splitLegacyBody(body);
  return {
    ...emptyLang(),
    title: p.title,
    subtitle: p.excerpt,
    category: p.tag,
    body: split.body,
    faq_title: split.faqTitle,
    faq: split.faq,
    cta: split.cta,
    meta_title: p.seoTitle ?? '',
    meta_description: p.metaDescription ?? '',
  };
}

/** Every legacy post as a live row. Same slug in both files = one article. */
export function legacyRows(): PostRow[] {
  const en = postsEn as LegacyPost[];
  const ar = postsAr as LegacyPost[];
  const slugs = Array.from(new Set([...en.map((p) => p.slug), ...ar.map((p) => p.slug)]));
  return slugs.map((slug) => {
    const e = en.find((p) => p.slug === slug);
    const a = ar.find((p) => p.slug === slug);
    const base = (e ?? a)!;
    const updated = e?.updated ?? a?.updated;
    return {
      slug,
      previous_slugs: [],
      status: 'published',
      publish_at: null,
      published_on: base.date,
      // 09:00 Cairo on the updated day: exactly the dateModified the posts had.
      content_updated_at: updated ? cairoIso(updated) : null,
      tags: [],
      author_slug: base.author ?? null,
      related_services: [],
      cover: base.cover ?? null,
      show_toc: true,
      en_enabled: !!e,
      ar_enabled: !!a,
      en: e ? toLang(e) : emptyLang(),
      ar: a ? toLang(a) : emptyLang(),
    };
  });
}
