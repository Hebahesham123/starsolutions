/**
 * Importing a prepared article into the post editor: front matter, Markdown
 * clean-up, and lifting the FAQ / Sources / "Short answer" sections into
 * their own fields. Pure functions (no DOM), shared by the editor and tests.
 */
import { attr, parseMarkdown, splitFaq } from './markdown';
import type { Lang, PostFaq, PostSource } from './post-utils';

export type FrontMatter = { slug?: string; locale?: Lang; keyword?: string; title?: string };

/** Splits "--- key: value … ---" off the top. Understands slug, locale, keyword, title and page (/ar/blog/<slug>). */
export function parseFrontMatter(src: string): { meta: FrontMatter; body: string } {
  const text = src.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (!m) return { meta: {}, body: text };
  const raw: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^\s*([A-Za-z_][\w-]*)\s*:\s*(.*?)\s*$/);
    if (kv) raw[kv[1].toLowerCase()] = kv[2].replace(/^["']|["']$/g, '');
  }
  const meta: FrontMatter = {};
  const page = raw.page ?? raw.url ?? raw.path;
  const pm = page?.match(/^(?:https?:\/\/[^/]+)?(\/ar)?\/blog\/([a-z0-9-]+)\/?$/);
  if (pm) { meta.slug = pm[2]; meta.locale = pm[1] ? 'ar' : 'en'; }
  if (raw.slug) meta.slug = raw.slug.replace(/^\/+|\/+$/g, '').split('/').pop();
  const loc = (raw.locale ?? raw.lang ?? raw.language ?? '').toLowerCase();
  if (loc.startsWith('ar')) meta.locale = 'ar';
  else if (loc.startsWith('en')) meta.locale = 'en';
  const kw = raw.keyword ?? raw.focus_keyword ?? raw.focus;
  if (kw) meta.keyword = kw;
  if (raw.title) meta.title = raw.title;
  return { meta, body: text.slice(m[0].length) };
}

/**
 * Brings Markdown into the dialect the site renders: a leading "# Title"
 * is returned separately (the post title is the H1), other "# " become "## ",
 * "####"+ become "### ", "* " bullets become "- ", images become ::image
 * blocks, links to www.starsolution.ai become relative, and any HTML tag that
 * slipped through is dropped (the body is never stored as HTML).
 */
export function normalizeMarkdown(src: string): { body: string; title?: string } {
  let text = src.replace(/\r\n?/g, '\n');
  let title: string | undefined;
  const h1 = text.match(/^\s*#\s+(.+)\n/);
  if (h1) { title = h1[1].trim(); text = text.slice(h1[0].length); }
  text = text
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^#\s+/gm, '## ')
    .replace(/^#{4,6}\s+/gm, '### ')
    .replace(/^(\s*)\*\s+/gm, '$1- ')
    .replace(/^\s*!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/gm, (_m, alt: string, src: string, caption?: string) =>
      `::image{src=${attr(src)} alt=${attr(alt)}${caption ? ` caption=${attr(caption)}` : ''}}`)
    .replace(/\]\(https?:\/\/(?:www\.)?starsolution\.ai(\/[^)\s]*)?\)/gi, (_m, path?: string) => `](${path || '/'})`)
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { body: text, title };
}

const bare = (s: string) => s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/[:：]\s*$/, '').replace(/\s+/g, ' ').trim().toLowerCase();

const FAQ = ['frequently asked questions', 'faq', 'faqs', 'أسئلة شائعة', 'الأسئلة الشائعة', 'اسئلة شائعة'];
const SOURCES = ['sources', 'references', 'المصادر', 'المراجع', 'مصادر'];
const SUMMARY = /^(short answer|the short answer|in short|tl;?dr|key takeaways|الإجابة|الاجابة|الخلاصة|باختصار)/;

export type Detected = {
  body: string;
  faqTitle?: string;
  faq: PostFaq[];
  sources: PostSource[];
  summary: string[];
  /** What was found, for the confirmation message. */
  found: string[];
};

/** The "## " sections of a body: [heading line index, end index). */
function sections(lines: string[]) {
  const out: { start: number; end: number; heading: string }[] = [];
  lines.forEach((l, i) => {
    const m = l.trim().match(/^##\s+(.*)$/);
    if (m) out.push({ start: i, end: lines.length, heading: m[1] });
  });
  for (let i = 0; i < out.length; i++) {
    const next = out[i + 1]?.start ?? lines.length;
    // A "---" rule also ends a section.
    const rule = lines.slice(out[i].start + 1, next).findIndex((l) => /^-{3,}$/.test(l.trim()));
    out[i].end = rule === -1 ? next : out[i].start + 1 + rule;
  }
  return out;
}

const listItems = (lines: string[]) =>
  lines.map((l) => l.trim().match(/^(?:[-*]|\d+[.)])\s+(.*)$/)?.[1]).filter((x): x is string => !!x);

/** Finds the FAQ, Sources and "Short answer" sections; returns them and the body without them. */
export function detectSections(body: string): Detected {
  const lines = body.replace(/\r\n?/g, '\n').split('\n');
  const result: Detected = { body, faq: [], sources: [], summary: [], found: [] };
  const remove: [number, number][] = [];

  for (const s of sections(lines)) {
    const name = bare(s.heading);
    const inner = lines.slice(s.start + 1, s.end);
    if (FAQ.includes(name) && result.faq.length === 0) {
      const { faq } = splitFaq(parseMarkdown(lines.slice(s.start, s.end).join('\n')), [s.heading]);
      if (faq.length) {
        result.faq = faq;
        result.faqTitle = s.heading;
        result.found.push(`${faq.length} FAQ question${faq.length === 1 ? '' : 's'} → FAQ fields`);
        remove.push([s.start, s.end]);
      }
    } else if (SOURCES.includes(name) && result.sources.length === 0) {
      const sources = listItems(inner).map((item) => {
        const link = item.match(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/);
        if (link) return { title: link[1].trim(), url: link[2] };
        const url = item.match(/https?:\/\/\S+/)?.[0].replace(/[).,]+$/, '');
        if (!url) return null;
        const title = item.replace(url, '').replace(/[\s:–—-]+$/, '').replace(/^[\s:–—-]+/, '').trim();
        return { title: title || url, url };
      }).filter((x): x is PostSource => !!x);
      if (sources.length) {
        result.sources = sources;
        result.found.push(`${sources.length} source${sources.length === 1 ? '' : 's'} → Sources fields`);
        remove.push([s.start, s.end]);
      }
    } else if (SUMMARY.test(name) && result.summary.length === 0) {
      const items = listItems(inner);
      if (items.length) {
        result.summary = items;
        result.found.push(`${items.length} bullet${items.length === 1 ? '' : 's'} → "Short answer in 30 seconds" box`);
        remove.push([s.start, s.end]);
      }
    }
  }

  if (remove.length) {
    const drop = new Set(remove.flatMap(([a, b]) => Array.from({ length: b - a }, (_, i) => a + i)));
    result.body = lines.filter((_, i) => !drop.has(i)).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  return result;
}
