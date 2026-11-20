'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { cairoDateOf, cairoToday } from '@/lib/dates';
import {
  checkExtraJsonLd, isLive, normalizeRow, slugify,
  type Lang, type PostImage, type PostLang, type PostRow,
} from '@/lib/post-utils';

export type SaveResult = { ok?: string; error?: string; id?: string; row?: PostRow };

const LANGS: Lang[] = ['en', 'ar'];
const LANG_NAME: Record<Lang, string> = { en: 'English', ar: 'Arabic' };

/** Every write re-checks admin membership (RLS rejects outsiders anyway; this gives a readable message). */
async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: 'Your session has expired. Sign in again.' };
  const { data: admin } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!admin) return { supabase, error: 'You do not have permission to do that.' };
  return { supabase };
}

/** The fields a reader sees. A change to any of them moves content_updated_at; SEO-only edits do not. */
function contentOf(row: PostRow) {
  const pick = (l: PostLang) => ({
    title: l.title, subtitle: l.subtitle, category: l.category, summary: l.summary, body: l.body,
    faq_title: l.faq_title ?? '', faq: l.faq, sources: l.sources, cta: l.cta, cover_alt: l.cover_alt,
  });
  return JSON.stringify({
    en: row.en_enabled ? pick(row.en) : null,
    ar: row.ar_enabled ? pick(row.ar) : null,
    cover: row.cover, related: row.related_services, author: row.author_slug,
  });
}

const enabledLangs = (row: PostRow) => LANGS.filter((l) => row[`${l}_enabled`]);

function validate(row: PostRow): string | null {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(row.slug)) return 'Slug: lowercase letters, numbers and single hyphens only (e.g. my-new-post).';
  const langs = enabledLangs(row);
  if (row.status !== 'draft' && langs.length === 0) return 'Enable at least one language before publishing or scheduling.';
  if (row.status === 'scheduled' && !row.publish_at) return 'Pick the date and time to publish.';
  for (const l of langs) {
    const v = row[l];
    const name = LANG_NAME[l];
    if (!v.title.trim()) return `${name}: the title is required.`;
    if (row.cover && !v.cover_alt.trim()) return `${name}: the cover image needs alt text.`;
    if (v.faq.some((f) => !f.q.trim() || !f.a.trim())) return `${name}: every FAQ item needs a question and an answer.`;
    if (v.sources.some((s) => !s.title.trim() || !/^https?:\/\//.test(s.url))) return `${name}: every source needs a title and a full link (https://…).`;
    if (v.canonical.trim() && !/^(\/|https:\/\/)/.test(v.canonical.trim())) return `${name}: the canonical must be a path (/blog/…) or a full https:// URL.`;
    const jsonError = checkExtraJsonLd(v.extra_jsonld);
    if (jsonError) return `${name}: ${jsonError}`;
  }
  return null;
}

/** Every public page a post can appear on, in both languages. */
async function refresh(supabase: ReturnType<typeof createClient>, slugs: string[], authors: (string | null)[]) {
  const { data } = await supabase.from('posts').select('slug');
  const all = new Set([...(data ?? []).map((r: { slug: string }) => r.slug), ...slugs]);
  for (const prefix of ['', '/ar']) {
    revalidatePath(`${prefix}/blog`);
    // Every post page: related articles and previous/next list other posts.
    for (const slug of Array.from(all)) revalidatePath(`${prefix}/blog/${slug}`);
    for (const a of authors) if (a) revalidatePath(`${prefix}/team/${a}`);
  }
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin/posts');
}

export async function savePost(id: string | null, input: PostRow): Promise<SaveResult> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const row = normalizeRow(input as unknown as Record<string, unknown>);
  row.slug = row.slug.trim() || slugify(row.en.title);
  row.tags = Array.from(new Set(row.tags.map((t) => t.trim().toLowerCase()).filter(Boolean)));
  for (const l of LANGS) {
    row[l].summary = row[l].summary.map((s) => s.trim()).filter(Boolean);
    row[l].extra_jsonld = row[l].extra_jsonld.trim();
  }

  const invalid = validate(row);
  if (invalid) return { error: invalid };

  let existing: PostRow | null = null;
  if (id) {
    const { data, error } = await supabase.from('posts').select('*').eq('id', id).maybeSingle();
    if (error) return { error: error.message };
    if (!data) return { error: 'This post no longer exists.' };
    existing = normalizeRow(data);
  }

  const now = new Date().toISOString();

  // When it goes live. Publishing now = now (unless it already went live);
  // scheduling keeps the chosen time; a draft keeps whatever it had.
  if (row.status === 'published') {
    const wasLive = existing && isLive(existing) && existing.publish_at;
    row.publish_at = wasLive ? existing!.publish_at : row.publish_at && new Date(row.publish_at).getTime() <= Date.now() ? row.publish_at : now;
  }
  if (row.status !== 'draft' && !row.published_on) {
    row.published_on = row.status === 'scheduled' && row.publish_at ? cairoDateOf(row.publish_at) : cairoToday();
  }

  // "Updated" moves only when what a reader sees changes, and is never before
  // the moment the post goes live.
  const changed = !existing || contentOf(existing) !== contentOf(row);
  row.content_updated_at = changed ? now : existing!.content_updated_at ?? now;
  if (row.status !== 'draft' && row.publish_at && row.content_updated_at < row.publish_at) row.content_updated_at = row.publish_at;

  // A live post's old slug keeps working (308 to the new one).
  row.previous_slugs = existing?.previous_slugs ?? [];
  if (existing && existing.slug !== row.slug && isLive(existing)) row.previous_slugs = [...row.previous_slugs, existing.slug];
  row.previous_slugs = Array.from(new Set(row.previous_slugs.filter((s) => s !== row.slug)));

  const { id: _id, created_at: _c, updated_at: _u, ...payload } = row;
  const query = id
    ? supabase.from('posts').update(payload).eq('id', id).select('*').single()
    : supabase.from('posts').insert(payload).select('*').single();
  const { data, error } = await query;
  if (error) {
    if (error.code === '23505') return { error: `Another post already uses the slug "${row.slug}".` };
    if (error.code === '42P01' || /relation .*posts/.test(error.message)) return { error: 'The posts table does not exist yet: run supabase/migrations/0005_posts.sql.' };
    return { error: error.message };
  }

  await refresh(supabase, [row.slug, ...(existing ? [existing.slug] : [])], [row.author_slug, existing?.author_slug ?? null]);
  const saved = normalizeRow(data);
  const live = isLive(saved);
  return {
    ok: saved.status === 'draft' ? 'Draft saved.' : live ? 'Saved and live. The blog, sitemap and pages are refreshed.' : 'Scheduled. It goes live at the chosen time.',
    id: saved.id,
    row: saved,
  };
}

export async function deletePost(id: string): Promise<SaveResult> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const { data } = await supabase.from('posts').select('slug, author_slug').eq('id', id).maybeSingle();
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) return { error: error.message };
  if (data) await refresh(supabase, [data.slug], [data.author_slug]);
  return { ok: 'Deleted.' };
}

const MAX_UPLOAD = 10 * 1024 * 1024;

/**
 * An image for a post: rotated upright, at most 1600px wide, WebP at quality
 * 80, into the public `blog` bucket. Returns its URL with the real width and
 * height, so the page can reserve the space and never shift.
 */
export async function uploadPostImage(formData: FormData): Promise<{ image?: PostImage; error?: string }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose an image file.' };
  if (!file.type.startsWith('image/')) return { error: 'That file is not an image.' };
  if (file.size > MAX_UPLOAD) return { error: 'Images must be under 10 MB.' };

  let output: { data: Buffer; info: { width: number; height: number } };
  try {
    const sharp = (await import('sharp')).default;
    output = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });
  } catch (e) {
    return { error: `Could not read that image: ${(e as Error).message}` };
  }

  const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'image';
  const month = new Date().toISOString().slice(0, 7).replace('-', '/');
  const path = `${month}/${base}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const { error } = await supabase.storage.from('blog').upload(path, output.data, {
    contentType: 'image/webp', cacheControl: '31536000', upsert: false,
  });
  if (error) {
    return { error: /bucket/i.test(error.message) ? 'The "blog" storage bucket does not exist yet: run supabase/migrations/0005_posts.sql.' : error.message };
  }
  const { data } = supabase.storage.from('blog').getPublicUrl(path);
  return { image: { src: data.publicUrl, width: output.info.width, height: output.info.height } };
}
