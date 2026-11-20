/**
 * Blog post types and the pure helpers both sides need: the public pages
 * (server) and the /admin editor (browser). Nothing here touches Supabase or
 * Node, so it is safe to import from a client component.
 */
import { inlineText, parseMarkdown, type Block, type Inline } from './markdown';

export type Lang = 'en' | 'ar';
export type PostStatus = 'draft' | 'published' | 'scheduled';

export type PostFaq = { q: string; a: string };
export type PostSource = { title: string; url: string };
export type PostImage = { src: string; width: number; height: number };
export type ServiceSection = 'solutions' | 'automations' | 'systems';
export type ServiceRef = { section: ServiceSection; slug: string };
/** The closing CTA block. Empty fields fall back to the default free-audit CTA. */
export type PostCta = { heading?: string; text?: string; button_label?: string; button_href?: string };

/** One language version of a post (the `en` / `ar` jsonb columns). */
export type PostLang = {
  title: string;
  subtitle: string;
  /** Shown as the eyebrow and articleSection; related articles match on it. */
  category: string;
  summary: string[];
  body: string;
  faq_title?: string;
  faq: PostFaq[];
  sources: PostSource[];
  cta: PostCta;
  cover_alt: string;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  canonical: string;
  noindex: boolean;
  og_title: string;
  og_description: string;
  og_image: PostImage | null;
  /** Raw JSON text, validated on save. */
  extra_jsonld: string;
};

/** A row of public.posts. */
export type PostRow = {
  id?: string;
  slug: string;
  previous_slugs: string[];
  status: PostStatus;
  publish_at: string | null;
  published_on: string | null;
  content_updated_at: string | null;
  tags: string[];
  author_slug: string | null;
  related_services: ServiceRef[];
  cover: PostImage | null;
  show_toc: boolean;
  en_enabled: boolean;
  ar_enabled: boolean;
  en: PostLang;
  ar: PostLang;
  created_at?: string;
  updated_at?: string;
};

export const SERVICE_SECTIONS: ServiceSection[] = ['solutions', 'automations', 'systems'];

export function emptyLang(): PostLang {
  return {
    title: '', subtitle: '', category: '', summary: [], body: '', faq: [], sources: [], cta: {},
    cover_alt: '', meta_title: '', meta_description: '', focus_keyword: '', canonical: '',
    noindex: false, og_title: '', og_description: '', og_image: null, extra_jsonld: '',
  };
}

/** Fills any field a stored jsonb object is missing, so old rows never crash a page. */
export function normalizeLang(raw: unknown): PostLang {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<PostLang>;
  const base = emptyLang();
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  return {
    ...base,
    title: str(r.title),
    subtitle: str(r.subtitle),
    category: str(r.category),
    summary: Array.isArray(r.summary) ? r.summary.filter((s) => typeof s === 'string' && s.trim()) : [],
    body: str(r.body),
    faq_title: r.faq_title ? str(r.faq_title) : undefined,
    faq: Array.isArray(r.faq) ? r.faq.filter((f) => f && f.q && f.a).map((f) => ({ q: str(f.q), a: str(f.a) })) : [],
    sources: Array.isArray(r.sources) ? r.sources.filter((s) => s && s.title && s.url).map((s) => ({ title: str(s.title), url: str(s.url) })) : [],
    cta: r.cta && typeof r.cta === 'object' ? r.cta : {},
    cover_alt: str(r.cover_alt),
    meta_title: str(r.meta_title),
    meta_description: str(r.meta_description),
    focus_keyword: str(r.focus_keyword),
    canonical: str(r.canonical),
    noindex: Boolean(r.noindex),
    og_title: str(r.og_title),
    og_description: str(r.og_description),
    og_image: isImage(r.og_image) ? r.og_image : null,
    extra_jsonld: str(r.extra_jsonld),
  };
}

export const isImage = (v: unknown): v is PostImage =>
  !!v && typeof v === 'object' && typeof (v as PostImage).src === 'string'
  && Number((v as PostImage).width) > 0 && Number((v as PostImage).height) > 0;

export function normalizeRow(raw: Record<string, unknown>): PostRow {
  const r = raw as Partial<PostRow>;
  return {
    id: r.id,
    slug: String(r.slug ?? ''),
    previous_slugs: Array.isArray(r.previous_slugs) ? r.previous_slugs : [],
    status: (['draft', 'published', 'scheduled'] as const).includes(r.status as PostStatus) ? (r.status as PostStatus) : 'draft',
    publish_at: r.publish_at ?? null,
    published_on: r.published_on ?? null,
    content_updated_at: r.content_updated_at ?? null,
    tags: Array.isArray(r.tags) ? r.tags : [],
    author_slug: r.author_slug ?? null,
    related_services: Array.isArray(r.related_services)
      ? r.related_services.filter((s) => s && SERVICE_SECTIONS.includes(s.section) && s.slug)
      : [],
    cover: isImage(r.cover) ? r.cover : null,
    show_toc: r.show_toc !== false,
    en_enabled: Boolean(r.en_enabled),
    ar_enabled: Boolean(r.ar_enabled),
    en: normalizeLang(r.en),
    ar: normalizeLang(r.ar),
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

/** Published or scheduled, and its time has come. Same rule as the RLS policy. */
export function isLive(row: Pick<PostRow, 'status' | 'publish_at'>, now = Date.now()): boolean {
  if (row.status === 'draft') return false;
  return !row.publish_at || new Date(row.publish_at).getTime() <= now;
}

/** The status the list shows: a scheduled post whose time has passed is published. */
export function displayStatus(row: Pick<PostRow, 'status' | 'publish_at'>): PostStatus {
  if (row.status === 'scheduled' && isLive(row)) return 'published';
  if (row.status === 'published' && !isLive(row)) return 'scheduled';
  return row.status;
}

/* ---------- Text ---------- */

export function slugify(text: string): string {
  return text
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

/** A heading without emoji, for ids and matching. */
const bare = (s: string) => s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim();

/** The anchor id of an H2: lowercase words joined by hyphens, Arabic kept. */
export function headingId(text: string): string {
  return bare(text).toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section';
}

/** Ids for a list of headings, made unique in order (a, a-2, a-3). */
export function uniqueIds(texts: string[]): string[] {
  const seen = new Map<string, number>();
  return texts.map((t) => {
    const id = headingId(t);
    const n = (seen.get(id) ?? 0) + 1;
    seen.set(id, n);
    return n === 1 ? id : `${id}-${n}`;
  });
}

/** What a reader reads: Markdown with link targets, block lines and symbols removed. */
export function plainText(markdown: string): string {
  return markdown
    .split(/\r?\n/).filter((l) => !l.trim().startsWith('::')).join('\n')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/[#*_>|`[\]-]+/g, ' ');
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** Every word in a language version that is on the page. */
export function postWords(lang: PostLang): number {
  return countWords([
    lang.subtitle, ...lang.summary, plainText(lang.body),
    lang.faq_title ?? '', ...lang.faq.flatMap((f) => [f.q, f.a]),
    lang.cta.heading ?? '', plainText(lang.cta.text ?? ''),
  ].join(' '));
}

/** Minutes at 200 words a minute, rounded up. */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.ceil(words / 200));
}

export function readingLabel(minutes: number, locale: Lang): string {
  if (locale === 'en') return `${minutes} min`;
  if (minutes === 1) return 'دقيقة واحدة';
  if (minutes === 2) return 'دقيقتان';
  if (minutes <= 10) return `${minutes} دقائق`;
  return `${minutes} دقيقة`;
}

/** The H2s of a body, in order, with their ids (what the TOC lists). */
export function bodyHeadings(body: string): { id: string; text: string }[] {
  const texts = parseMarkdown(body).filter((b) => b.type === 'h2').map((b) => (b as { text: string }).text);
  const ids = uniqueIds(texts);
  return texts.map((text, i) => ({ id: ids[i], text }));
}

/* ---------- Validation ---------- */

/** Null when the extra JSON-LD is empty or usable; otherwise why not. */
export function checkExtraJsonLd(text: string): string | null {
  if (!text.trim()) return null;
  if (/<\/?script/i.test(text)) return 'Extra JSON-LD must be JSON only, without <script> tags.';
  let data: unknown;
  try { data = JSON.parse(text); } catch (e) { return `Extra JSON-LD is not valid JSON: ${(e as Error).message}`; }
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return 'Extra JSON-LD is an empty list.';
  for (const item of items) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return 'Extra JSON-LD must be an object or a list of objects.';
    if (!('@type' in item)) return 'Every extra JSON-LD object needs an "@type".';
  }
  return null;
}

/* ---------- SEO checklist (warnings only) ---------- */

export type CheckItem = { ok: boolean; label: string; detail?: string };

const internalHref = (href: string) => href.startsWith('/') || /^https?:\/\/(www\.)?starsolution\.ai/i.test(href);

function links(nodes: Inline[]): string[] {
  return nodes.flatMap((n) => (n.type === 'link' ? [n.href, ...links(n.children)] : n.type === 'text' ? [] : links(n.children)));
}

export function seoChecklist(lang: PostLang, cover: PostImage | null): CheckItem[] {
  const kw = lang.focus_keyword.trim().toLowerCase();
  const blocks = parseMarkdown(lang.body);
  const h2s = blocks.filter((b) => b.type === 'h2').map((b) => (b as { text: string }).text.toLowerCase());
  const first100 = plainText(lang.body).split(/\s+/).filter(Boolean).slice(0, 100).join(' ').toLowerCase();
  const metaTitle = lang.meta_title || lang.title;
  const words = postWords(lang);

  const inlineOf = (b: Block): Inline[][] =>
    b.type === 'p' || b.type === 'quote' ? [b.inline] : b.type === 'ul' || b.type === 'ol' ? b.items : b.type === 'table' ? [...b.head, ...b.rows.flat()] : [];
  const hrefs = blocks.flatMap((b) => inlineOf(b).flatMap(links));
  const callouts = blocks.filter((b) => b.type === 'directive' && (b.name === 'callout' || b.name === 'cta')).length;
  const internal = hrefs.filter(internalHref).length + callouts + lang.summary.flatMap((s) => links(parseInlineSafe(s))).filter(internalHref).length;

  const images = blocks.filter((b): b is Extract<Block, { type: 'directive' }> => b.type === 'directive' && b.name === 'image');
  const missingAlt = images.filter((b) => !b.attrs.alt?.trim()).length + (cover && !lang.cover_alt.trim() ? 1 : 0);

  const tl = metaTitle.length;
  const dl = lang.meta_description.length;
  const has = (s: string) => !!kw && s.toLowerCase().includes(kw);

  return [
    { ok: !!kw, label: 'Focus keyword set', detail: kw ? undefined : 'Used only for this checklist; never output on the page.' },
    { ok: has(metaTitle), label: 'Focus keyword in the meta title' },
    { ok: has(lang.title), label: 'Focus keyword in the H1 (title)' },
    { ok: !!kw && first100.includes(kw), label: 'Focus keyword in the first 100 words' },
    { ok: !!kw && h2s.some((h) => h.includes(kw)), label: 'Focus keyword in at least one H2' },
    { ok: words >= 600, label: `Word count: ${words}`, detail: words >= 600 ? undefined : 'Aim for 600+ words.' },
    { ok: missingAlt === 0, label: 'All images have alt text', detail: missingAlt ? `${missingAlt} missing` : undefined },
    { ok: internal >= 3, label: `Internal links: ${internal}`, detail: internal >= 3 ? undefined : 'Aim for at least 3.' },
    { ok: tl >= 50 && tl <= 60, label: `Meta title length: ${tl}`, detail: '50–60 characters.' },
    { ok: dl >= 120 && dl <= 155, label: `Meta description length: ${dl}`, detail: '120–155 characters.' },
  ];
}

function parseInlineSafe(s: string): Inline[] {
  const b = parseMarkdown(s)[0];
  return b && b.type === 'p' ? b.inline : [];
}

export { inlineText };
