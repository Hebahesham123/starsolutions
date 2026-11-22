'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deletePost, savePost, uploadPostImage } from './actions';
import { MarkdownField } from './MarkdownField';
import { InlineMd, PostBody, type ServiceLookup } from '@/components/PostBody';
import { Faq } from '@/components/Faq';
import { detectSections, normalizeMarkdown, parseFrontMatter, type FrontMatter } from '@/lib/post-import';
import {
  SERVICE_SECTIONS, checkExtraJsonLd, displayStatus, isLive, seoChecklist, slugify,
  type Lang, type PostImage, type PostLang, type PostRow, type PostStatus,
} from '@/lib/post-utils';
import { cairoLocalOf, cairoLocalToIso, cairoToday } from '@/lib/dates';
import { localeHref } from '@/lib/i18n';
import { abs, blogPosting, breadcrumbs, faqPage } from '@/lib/schema';
import type { BlogPost } from '@/lib/posts';

type Tab = 'content' | 'media' | 'seo' | 'settings';
const LANGS: Lang[] = ['en', 'ar'];
const LANG_NAME: Record<Lang, string> = { en: 'English', ar: 'Arabic' };
const dirOf = (l: Lang) => (l === 'ar' ? 'rtl' : 'ltr');

export type EditorProps = {
  id: string | null;
  initial: PostRow;
  authors: { slug: string; name: string }[];
  services: Record<Lang, ServiceLookup>;
  categories: Record<Lang, string[]>;
  whatsapp: Record<Lang, string>;
};

function Counter({ value, min, max }: { value: string; min: number; max: number }) {
  const n = value.length;
  const ok = n >= min && n <= max;
  return <span className={`post-counter ${ok ? 'is-ok' : n ? 'is-warn' : ''}`}>{n} / {min}–{max}</span>;
}

function Field({ label, htmlFor, help, wide, children, extra }: {
  label: string; htmlFor?: string; help?: React.ReactNode; wide?: boolean; children: React.ReactNode; extra?: React.ReactNode;
}) {
  return (
    <div className={`admin-form-field${wide ? ' is-wide' : ''}`}>
      <label htmlFor={htmlFor} className="post-label-row"><span className="post-label">{label}</span>{extra}</label>
      {children}
      {help && <p className="admin-help">{help}</p>}
    </div>
  );
}

export function PostEditor({ id: initialId, initial, authors, services, categories, whatsapp }: EditorProps) {
  const router = useRouter();
  const [id, setId] = React.useState(initialId);
  const [row, setRow] = React.useState<PostRow>(initial);
  const [saved, setSaved] = React.useState(JSON.stringify(initial));
  const [tab, setTab] = React.useState<Tab>('content');
  const [lang, setLang] = React.useState<Lang>(initial.en_enabled || !initial.ar_enabled ? 'en' : 'ar');
  const [slugTouched, setSlugTouched] = React.useState(Boolean(initialId));
  const [tagsText, setTagsText] = React.useState(initial.tags.join(', '));
  const [summaryText, setSummaryText] = React.useState<Record<Lang, string>>({ en: initial.en.summary.join('\n'), ar: initial.ar.summary.join('\n') });
  const [message, setMessage] = React.useState<{ ok?: string; error?: string }>({});
  const [pending, startTransition] = React.useTransition();
  const [uploading, setUploading] = React.useState<string | null>(null);

  const dirty = JSON.stringify(row) !== saved;
  React.useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (patch: Partial<PostRow>) => setRow((r) => ({ ...r, ...patch }));
  const setL = (l: Lang, patch: Partial<PostLang>) => setRow((r) => ({ ...r, [l]: { ...r[l], ...patch } }));
  const L = row[lang];
  const dir = dirOf(lang);
  const path = `/blog/${row.slug || 'new-post'}`;

  const onTitle = (value: string) => {
    setL(lang, { title: value });
    if (lang === 'en' && !slugTouched) set({ slug: slugify(value) });
  };

  /**
   * A whole article into the Body: an .md file (front matter fills slug,
   * language and focus keyword; a leading "# Title" fills an empty title) or
   * converted HTML. FAQ / Sources / "Short answer" sections are offered to
   * their own fields, with a confirmation, before anything moves.
   */
  const handleImport = (text: string, kind: 'md' | 'html') => {
    const { meta, body: raw } = kind === 'md' ? parseFrontMatter(text) : { meta: {} as FrontMatter, body: text };
    const target: Lang = meta.locale ?? lang;
    const current = row[target];
    if (current.body.trim() && !window.confirm(`Replace the current ${LANG_NAME[target]} body with the imported article?`)) return;

    const { body: normalized, title } = normalizeMarkdown(raw);
    const found = detectSections(normalized);
    let move = false;
    if (found.found.length) {
      const replacing = [
        found.faq.length && current.faq.length ? 'FAQ' : '',
        found.sources.length && current.sources.length ? 'Sources' : '',
        found.summary.length && current.summary.length ? 'Short answer' : '',
        found.cta && (current.cta.heading || current.cta.text || current.cta.button_label) ? 'CTA block' : '',
      ].filter(Boolean);
      move = window.confirm(
        `Found in the article:\n• ${found.found.join('\n• ')}\n\nMove them into their fields?`
        + (replacing.length ? `\n(This replaces the current ${replacing.join(', ')}.)` : '')
        + '\n\nCancel keeps everything in the body.',
      );
    }

    const patch: Partial<PostLang> = { body: move ? found.body : normalized };
    if (move && found.faq.length) { patch.faq = found.faq; patch.faq_title = found.faqTitle; }
    if (move && found.sources.length) patch.sources = found.sources;
    if (move && found.summary.length) {
      patch.summary = found.summary;
      setSummaryText((s) => ({ ...s, [target]: found.summary.join('\n') }));
    }
    if (move && found.cta) patch.cta = found.cta;
    const newTitle = meta.title || title;
    if (newTitle && !current.title.trim()) patch.title = newTitle;
    if (meta.keyword) patch.focus_keyword = meta.keyword;

    // The imported language is switched on; the other one is switched off if
    // it has nothing in it yet (a new post starts with both enabled).
    const other: Lang = target === 'en' ? 'ar' : 'en';
    setRow((r) => ({
      ...r,
      [`${target}_enabled`]: true,
      ...(!r[other].title.trim() && !r[other].body.trim() ? { [`${other}_enabled`]: false } : {}),
      ...(meta.slug ? { slug: slugify(meta.slug) || r.slug } : !r.slug && target === 'en' && patch.title ? { slug: slugify(patch.title) } : {}),
      [target]: { ...r[target], ...patch },
    }));
    if (meta.slug) setSlugTouched(true);
    setLang(target);

    const filled = [
      meta.slug && `slug "${meta.slug}"`,
      meta.locale && `language ${LANG_NAME[meta.locale]}`,
      meta.keyword && `focus keyword "${meta.keyword}"`,
      patch.title && 'title',
      move && found.found.length && found.found.map((f) => f.split(' → ')[0]).join(', '),
    ].filter(Boolean);
    setMessage({ ok: `Imported into the ${LANG_NAME[target]} body${filled.length ? `; filled ${filled.join(', ')}` : ''}. Review it, then save.` });
  };

  const upload = async (file: File, label: string): Promise<PostImage | null> => {
    setUploading(label);
    const fd = new FormData();
    fd.set('file', file);
    const res = await uploadPostImage(fd);
    setUploading(null);
    if (res.error) { setMessage({ error: res.error }); return null; }
    return res.image ?? null;
  };

  const save = React.useCallback(() => {
    setMessage({});
    startTransition(async () => {
      const res = await savePost(id, row);
      if (res.error) { setMessage({ error: res.error }); return; }
      if (res.row) {
        setRow(res.row);
        setSaved(JSON.stringify(res.row));
        setTagsText(res.row.tags.join(', '));
      }
      setMessage({ ok: res.ok });
      if (!id && res.id) { setId(res.id); router.replace(`/admin/posts/${res.id}`); }
      router.refresh();
    });
  }, [id, row, router]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const remove = () => {
    if (!id || !window.confirm('Delete this post permanently? Its pages will 404.')) return;
    startTransition(async () => {
      const res = await deletePost(id);
      if (res.error) { setMessage({ error: res.error }); return; }
      setSaved(JSON.stringify(row));
      router.replace('/admin/posts?deleted=1');
    });
  };

  const status = displayStatus(row);
  const live = isLive(row) && row.status !== 'draft';
  const checklist = seoChecklist(L, row.cover);
  const jsonError = checkExtraJsonLd(L.extra_jsonld);

  /* ---------- schema preview, from the same builders the page uses ---------- */
  const schemaPreview = React.useMemo(() => {
    const author = authors.find((a) => a.slug === row.author_slug);
    const authorObj = author ? {
      name: author.name, href: localeHref(lang, `/team/${author.slug}`), personId: `${abs(`/team/${author.slug}`)}#person`,
    } : null;
    const post = {
      slug: row.slug, title: L.title, subtitle: L.subtitle, category: L.category, cover: row.cover,
      date: row.published_on ?? cairoToday(), updated: row.content_updated_at ?? undefined,
    } as unknown as BlogPost;
    const blocks: object[] = [
      blogPosting(post, lang, path, authorObj),
      breadcrumbs([
        { href: localeHref(lang, '/'), label: lang === 'ar' ? 'الرئيسية' : 'Home' },
        { href: localeHref(lang, '/blog'), label: lang === 'ar' ? 'المدونة' : 'Blog' },
        { label: L.title },
      ]),
    ];
    if (L.faq.length) blocks.push(faqPage(L.faq, lang, path));
    if (L.extra_jsonld.trim() && !jsonError) blocks.push(JSON.parse(L.extra_jsonld));
    return JSON.stringify(blocks, null, 2);
  }, [authors, row, L, lang, path, jsonError]);

  const langTabs = (
    <div className="post-lang-tabs" role="tablist" aria-label="Language">
      {LANGS.map((l) => (
        <button key={l} type="button" role="tab" aria-selected={lang === l} className={lang === l ? 'is-on' : ''} onClick={() => setLang(l)}>
          {LANG_NAME[l]} <span className={`post-dot ${row[`${l}_enabled`] ? 'is-on' : ''}`} aria-label={row[`${l}_enabled`] ? 'enabled' : 'off'} />
        </button>
      ))}
    </div>
  );

  const serviceOptions = Array.from(new Set([...Object.keys(services.en), ...Object.keys(services.ar)])).sort();

  return (
    <div className="post-editor">
      <div className="post-tabs" role="tablist" aria-label="Sections">
        {(['content', 'media', 'seo', 'settings'] as Tab[]).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? 'is-on' : ''} onClick={() => setTab(t)}>
            {t === 'seo' ? 'SEO' : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ---------------- CONTENT ---------------- */}
      {tab === 'content' && (
        <div className="admin-card post-card-pad">
          {langTabs}
          <label className="admin-check">
            <input type="checkbox" checked={row[`${lang}_enabled`]} onChange={(e) => set({ [`${lang}_enabled`]: e.target.checked } as Partial<PostRow>)} />
            <span>Publish the {LANG_NAME[lang]} version{lang === 'ar' ? ' (/ar/blog/…)' : ' (/blog/…)'}</span>
          </label>

          <div className="admin-form-grid">
            <Field label={`Title (H1) · ${LANG_NAME[lang]}`} htmlFor="p-title" wide>
              <input id="p-title" type="text" value={L.title} onChange={(e) => onTitle(e.target.value)} dir={dir} />
            </Field>
            <Field label="Slug (both languages)" htmlFor="p-slug" help={
              id && live && initial.slug && row.slug !== initial.slug
                ? <strong>Changing a live post&apos;s slug changes its URL. The old URL will redirect (308) to the new one.</strong>
                : `URL: ${localeHref(lang, path)}. Filled from the English title until you edit it.`
            }>
              <input id="p-slug" type="text" value={row.slug} dir="ltr"
                onChange={(e) => { setSlugTouched(true); set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }); }} />
            </Field>
            <Field label={`Category · ${LANG_NAME[lang]}`} htmlFor="p-cat" help="Shown above the title; related articles match on it.">
              <input id="p-cat" type="text" list={`cats-${lang}`} value={L.category} onChange={(e) => setL(lang, { category: e.target.value })} dir={dir} />
              <datalist id={`cats-${lang}`}>{categories[lang].map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <Field label="Subtitle" htmlFor="p-sub" wide help="The short line under the H1. Also the default meta description.">
              <textarea id="p-sub" rows={2} value={L.subtitle} onChange={(e) => setL(lang, { subtitle: e.target.value })} dir={dir} />
            </Field>
            <Field label='"Short answer in 30 seconds" (one bullet per line)' htmlFor="p-sum" wide help="Leave empty to hide the box. **bold** and [links](/path) work.">
              <textarea id="p-sum" rows={4} value={summaryText[lang]} dir={dir} className="admin-mono"
                onChange={(e) => { setSummaryText((s) => ({ ...s, [lang]: e.target.value })); setL(lang, { summary: e.target.value.split('\n') }); }} />
            </Field>
            <Field label="Body" htmlFor="p-body" wide help="## H2 and ### H3 headings (the H2s build the table of contents), lists, tables, **bold**, [links](/path), and the blocks from Insert.">
              <MarkdownField
                id="p-body"
                value={L.body}
                onChange={(v) => setL(lang, { body: v })}
                dir={dir}
                services={services[lang]}
                onUpload={(file) => upload(file, 'body')}
                onImport={handleImport}
                preview={
                  <div className="detail-body">
                    {L.summary.some((s) => s.trim()) && (
                      <aside className="post-summary">
                        <p className="post-summary-title">{lang === 'ar' ? 'الإجابة المختصرة في 30 ثانية' : 'Short answer in 30 seconds'}</p>
                        <ul>{L.summary.filter((s) => s.trim()).map((s) => <li key={s}><InlineMd text={s} locale={lang} path={path} /></li>)}</ul>
                      </aside>
                    )}
                    <PostBody body={L.body} locale={lang} path={path} services={services[lang]} whatsapp={whatsapp[lang]} />
                    {L.faq.length > 0 && <div className="post-md"><Faq items={L.faq} locale={lang} path={path} embedded title={L.faq_title} /></div>}
                    {L.sources.length > 0 && (
                      <section className="post-sources">
                        <h2>{lang === 'ar' ? 'المصادر' : 'Sources'}</h2>
                        <ol>{L.sources.map((s, i) => <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ol>
                      </section>
                    )}
                    <section className="post-cta-block">
                      <h2>{L.cta.heading || (lang === 'ar' ? 'تريد تشغيل هذا على متجرك؟' : 'Want this running on your store?')}</h2>
                      {L.cta.text
                        ? <PostBody body={L.cta.text} locale={lang} path={path} services={services[lang]} whatsapp={whatsapp[lang]} />
                        : <p className="post-cta-text">{lang === 'ar' ? 'ابدأ بتحليل مجاني ونرسم لك الخطة.' : 'Start with a free audit and we will map it out for you.'}</p>}
                      <div className="post-cta-actions">
                        <span className="btn btn-primary">{L.cta.button_label || (lang === 'ar' ? 'اطلب تحليلك المجاني' : 'Get free audit')}</span>
                        <span className="btn btn-ghost">WhatsApp</span>
                      </div>
                    </section>
                  </div>
                }
              />
            </Field>
          </div>

          <h3 className="post-sub-h">FAQ</h3>
          <Field label="FAQ heading (optional)" htmlFor="p-faqt">
            <input id="p-faqt" type="text" value={L.faq_title ?? ''} placeholder={lang === 'ar' ? 'أسئلة شائعة' : 'Frequently asked questions'}
              onChange={(e) => setL(lang, { faq_title: e.target.value || undefined })} dir={dir} />
          </Field>
          {L.faq.map((item, i) => (
            <div className="post-repeat" key={i}>
              <input type="text" placeholder="Question (rendered as H3)" value={item.q} dir={dir}
                onChange={(e) => setL(lang, { faq: L.faq.map((f, j) => (j === i ? { ...f, q: e.target.value } : f)) })} />
              <textarea rows={3} placeholder="Answer" value={item.a} dir={dir}
                onChange={(e) => setL(lang, { faq: L.faq.map((f, j) => (j === i ? { ...f, a: e.target.value } : f)) })} />
              <div className="post-repeat-actions">
                <button type="button" disabled={i === 0} onClick={() => { const f = [...L.faq]; [f[i - 1], f[i]] = [f[i], f[i - 1]]; setL(lang, { faq: f }); }}>↑</button>
                <button type="button" disabled={i === L.faq.length - 1} onClick={() => { const f = [...L.faq]; [f[i + 1], f[i]] = [f[i], f[i + 1]]; setL(lang, { faq: f }); }}>↓</button>
                <button type="button" onClick={() => setL(lang, { faq: L.faq.filter((_, j) => j !== i) })}>Remove</button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setL(lang, { faq: [...L.faq, { q: '', a: '' }] })}>+ Add question</button>

          <h3 className="post-sub-h">Sources</h3>
          {L.sources.map((s, i) => (
            <div className="post-repeat post-repeat-row" key={i}>
              <input type="text" placeholder="Title" value={s.title} dir={dir}
                onChange={(e) => setL(lang, { sources: L.sources.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
              <input type="text" placeholder="https://…" value={s.url} dir="ltr"
                onChange={(e) => setL(lang, { sources: L.sources.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} />
              <button type="button" onClick={() => setL(lang, { sources: L.sources.filter((_, j) => j !== i) })}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setL(lang, { sources: [...L.sources, { title: '', url: '' }] })}>+ Add source</button>

          <h3 className="post-sub-h">CTA block (end of the post)</h3>
          <p className="admin-help">Leave everything empty for the default free-audit CTA. WhatsApp is always offered beside the button.</p>
          <div className="admin-form-grid">
            <Field label="Heading" htmlFor="p-ctah">
              <input id="p-ctah" type="text" value={L.cta.heading ?? ''} dir={dir} onChange={(e) => setL(lang, { cta: { ...L.cta, heading: e.target.value } })} />
            </Field>
            <Field label="Button label" htmlFor="p-ctab" help="Default: the free audit button.">
              <input id="p-ctab" type="text" value={L.cta.button_label ?? ''} dir={dir} onChange={(e) => setL(lang, { cta: { ...L.cta, button_label: e.target.value } })} />
            </Field>
            <Field label="Text (Markdown)" htmlFor="p-ctat" wide>
              <textarea id="p-ctat" rows={4} value={L.cta.text ?? ''} dir={dir} className="admin-mono" onChange={(e) => setL(lang, { cta: { ...L.cta, text: e.target.value } })} />
            </Field>
            <Field label="Button link" htmlFor="p-ctal" help="Default: the contact page.">
              <input id="p-ctal" type="text" value={L.cta.button_href ?? ''} dir="ltr" placeholder={localeHref(lang, '/contact')} onChange={(e) => setL(lang, { cta: { ...L.cta, button_href: e.target.value } })} />
            </Field>
          </div>

          <h3 className="post-sub-h">Both languages</h3>
          <div className="admin-form-grid">
            <Field label="Author" htmlFor="p-author" help="Linked to their team page.">
              <select id="p-author" value={row.author_slug ?? ''} onChange={(e) => set({ author_slug: e.target.value || null })}>
                <option value="">— none (StarSolution) —</option>
                {authors.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
              </select>
            </Field>
            <Field label="Tags (comma-separated)" htmlFor="p-tags" help="Not shown on the page; used to pick related articles.">
              <input id="p-tags" type="text" value={tagsText} dir="ltr"
                onChange={(e) => { setTagsText(e.target.value); set({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }); }} />
            </Field>
            <Field label="Related services" wide help="Shown as links at the end of the post.">
              <div className="post-services">
                {SERVICE_SECTIONS.map((section) => (
                  <fieldset key={section}>
                    <legend>{section}</legend>
                    {serviceOptions.filter((k) => k.startsWith(`${section}/`)).map((k) => {
                      const slug = k.slice(section.length + 1);
                      const on = row.related_services.some((s) => s.section === section && s.slug === slug);
                      return (
                        <label key={k} className="admin-check">
                          <input type="checkbox" checked={on} onChange={(e) => set({
                            related_services: e.target.checked
                              ? [...row.related_services, { section, slug }]
                              : row.related_services.filter((s) => !(s.section === section && s.slug === slug)),
                          })} />
                          <span>{(services.en[k] ?? services.ar[k]).title}</span>
                        </label>
                      );
                    })}
                  </fieldset>
                ))}
              </div>
            </Field>
          </div>
        </div>
      )}

      {/* ---------------- MEDIA ---------------- */}
      {tab === 'media' && (
        <div className="admin-card post-card-pad">
          <h3 className="post-sub-h">Cover image</h3>
          <p className="admin-help">Converted to WebP (max 1600px wide) with its width and height stored, so the page never shifts. Alt text is required for every enabled language.</p>
          {row.cover && (
            <figure className="post-media-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={row.cover.src} alt="" width={row.cover.width} height={row.cover.height} />
              <figcaption>{row.cover.width} × {row.cover.height} · WebP <button type="button" className="admin-link" onClick={() => set({ cover: null })}>Remove</button></figcaption>
            </figure>
          )}
          <input type="file" accept="image/*" disabled={!!uploading}
            onChange={async (e) => { const file = e.target.files?.[0]; if (file) { const img = await upload(file, 'cover'); if (img) set({ cover: img }); } e.target.value = ''; }} />
          {uploading === 'cover' && <p className="admin-help">Uploading and converting…</p>}
          <div className="admin-form-grid" style={{ marginTop: 14 }}>
            {LANGS.map((l) => (
              <Field key={l} label={`Cover alt text · ${LANG_NAME[l]}${row[`${l}_enabled`] && row.cover ? ' *' : ''}`} htmlFor={`p-alt-${l}`}>
                <input id={`p-alt-${l}`} type="text" value={row[l].cover_alt} dir={dirOf(l)} onChange={(e) => setL(l, { cover_alt: e.target.value })} />
              </Field>
            ))}
          </div>

          <h3 className="post-sub-h">Share image (Open Graph)</h3>
          <p className="admin-help">Optional, per language. Defaults to the cover, then the site&apos;s share image. 1200 × 630 works best.</p>
          <div className="admin-form-grid">
            {LANGS.map((l) => (
              <div key={l} className="admin-form-field">
                <p className="post-label">{LANG_NAME[l]}</p>
                {row[l].og_image && (
                  <figure className="post-media-preview is-small">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={row[l].og_image!.src} alt="" width={row[l].og_image!.width} height={row[l].og_image!.height} />
                    <figcaption>{row[l].og_image!.width} × {row[l].og_image!.height} <button type="button" className="admin-link" onClick={() => setL(l, { og_image: null })}>Remove</button></figcaption>
                  </figure>
                )}
                <input type="file" accept="image/*" disabled={!!uploading}
                  onChange={async (e) => { const file = e.target.files?.[0]; if (file) { const img = await upload(file, `og-${l}`); if (img) setL(l, { og_image: img }); } e.target.value = ''; }} />
              </div>
            ))}
          </div>
          <p className="admin-help" style={{ marginTop: 14 }}>Images inside the body (single or gallery) are uploaded from the body toolbar: Insert → Image / gallery.</p>
        </div>
      )}

      {/* ---------------- SEO ---------------- */}
      {tab === 'seo' && (
        <div className="post-seo-grid">
          <div className="admin-card post-card-pad">
            {langTabs}
            <div className="admin-form-grid">
              <Field label="Meta title" htmlFor="s-title" wide extra={<Counter value={L.meta_title || L.title} min={50} max={60} />}
                help="The whole <title>, as written. Empty = the H1 + “· StarSolution.ai”.">
                <input id="s-title" type="text" value={L.meta_title} placeholder={L.title} dir={dir} onChange={(e) => setL(lang, { meta_title: e.target.value })} />
              </Field>
              <Field label="Meta description" htmlFor="s-desc" wide extra={<Counter value={L.meta_description} min={120} max={155} />}
                help="Empty = the subtitle.">
                <textarea id="s-desc" rows={3} value={L.meta_description} placeholder={L.subtitle} dir={dir} onChange={(e) => setL(lang, { meta_description: e.target.value })} />
              </Field>
              <Field label="Focus keyword" htmlFor="s-kw" help="Only for the checklist. Never output on the page (no meta keywords).">
                <input id="s-kw" type="text" value={L.focus_keyword} dir={dir} onChange={(e) => setL(lang, { focus_keyword: e.target.value })} />
              </Field>
              <Field label="Canonical URL" htmlFor="s-canon" help="Empty = this post's own URL.">
                <input id="s-canon" type="text" value={L.canonical} dir="ltr" placeholder={abs(localeHref(lang, path))} onChange={(e) => setL(lang, { canonical: e.target.value })} />
              </Field>
              <div className="admin-form-field is-wide">
                <label className="admin-check">
                  <input type="checkbox" checked={!L.noindex} onChange={(e) => setL(lang, { noindex: !e.target.checked })} />
                  <span>Index this page in search engines {L.noindex && <em>(noindex: also left out of the sitemap)</em>}</span>
                </label>
              </div>
              <Field label="Open Graph title" htmlFor="s-ogt" help="Empty = the meta title.">
                <input id="s-ogt" type="text" value={L.og_title} placeholder={L.meta_title || L.title} dir={dir} onChange={(e) => setL(lang, { og_title: e.target.value })} />
              </Field>
              <Field label="Open Graph description" htmlFor="s-ogd" help="Empty = the meta description.">
                <input id="s-ogd" type="text" value={L.og_description} placeholder={L.meta_description || L.subtitle} dir={dir} onChange={(e) => setL(lang, { og_description: e.target.value })} />
              </Field>
              <Field label="Extra JSON-LD (optional)" htmlFor="s-json" wide help={jsonError ? <span className="post-error">{jsonError}</span> : 'Raw JSON (no <script> tag): an object or a list, each with "@type". Validated before saving.'}>
                <textarea id="s-json" rows={6} value={L.extra_jsonld} dir="ltr" className="admin-mono" onChange={(e) => setL(lang, { extra_jsonld: e.target.value })} />
              </Field>
            </div>
            <details className="post-schema">
              <summary>Generated schema (BlogPosting, BreadcrumbList, FAQPage)</summary>
              <pre>{schemaPreview}</pre>
            </details>
          </div>

          <aside className="admin-card post-card-pad post-checklist">
            <h3 className="post-sub-h">SEO checklist · {LANG_NAME[lang]}</h3>
            <p className="admin-help">Warnings only — nothing here blocks saving.</p>
            <ul>
              {checklist.map((c) => (
                <li key={c.label} className={c.ok ? 'is-ok' : 'is-warn'}>
                  <span aria-hidden="true">{c.ok ? '✓' : '!'}</span>
                  <span>{c.label}{c.detail && <small>{c.detail}</small>}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}

      {/* ---------------- SETTINGS ---------------- */}
      {tab === 'settings' && (
        <div className="admin-card post-card-pad">
          <h3 className="post-sub-h">Status</h3>
          <div className="post-status-choice">
            {(['draft', 'published', 'scheduled'] as PostStatus[]).map((s) => (
              <label key={s} className={`admin-check${row.status === s ? ' is-on' : ''}`}>
                <input type="radio" name="status" checked={row.status === s}
                  onChange={() => set({ status: s, ...(s === 'scheduled' && !row.publish_at ? { publish_at: cairoLocalToIso(`${cairoToday()}T09:00`) } : {}) })} />
                <span>{s === 'draft' ? 'Draft' : s === 'published' ? 'Publish now' : 'Schedule'}</span>
              </label>
            ))}
          </div>
          {row.status === 'scheduled' && (
            <Field label="Publish at (Cairo time)" htmlFor="p-at">
              <input id="p-at" type="datetime-local" value={row.publish_at ? cairoLocalOf(row.publish_at) : ''}
                onChange={(e) => set({ publish_at: e.target.value ? cairoLocalToIso(e.target.value) : null })} />
            </Field>
          )}
          <p className="admin-help">
            Currently: <strong>{status === 'published' ? 'live' : status}</strong>
            {status === 'scheduled' && row.publish_at ? ` — goes live ${cairoLocalOf(row.publish_at).replace('T', ' ')} Cairo time` : ''}.
            Saving a published post refreshes the post, the blog index, the sitemap and the author&apos;s page at once.
          </p>

          <div className="admin-form-grid" style={{ marginTop: 14 }}>
            <Field label="Published date (shown on the page)" htmlFor="p-pub" help="Empty = set automatically when it goes live.">
              <input id="p-pub" type="date" value={row.published_on ?? ''} onChange={(e) => set({ published_on: e.target.value || null })} />
            </Field>
            <div className="admin-form-field">
              <p className="post-label">Last content update</p>
              <p className="admin-muted">{row.content_updated_at ? cairoLocalOf(row.content_updated_at).replace('T', ' ') + ' Cairo' : '—'}</p>
              <p className="admin-help">Moves automatically when the text, FAQ, sources, CTA or cover change (not for SEO-only edits).</p>
            </div>
          </div>

          <label className="admin-check" style={{ marginTop: 10 }}>
            <input type="checkbox" checked={row.show_toc} onChange={(e) => set({ show_toc: e.target.checked })} />
            <span>Show the table of contents (built from the H2s)</span>
          </label>

          {id && (
            <div className="post-danger">
              <button type="button" className="admin-danger-btn" onClick={remove} disabled={pending}>Delete post</button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- FOOTER ---------------- */}
      <div className="post-savebar">
        <div className="post-savebar-msg">
          {message.error && <span className="post-error">{message.error}</span>}
          {message.ok && !dirty && <span className="post-ok">{message.ok}</span>}
          {dirty && !message.error && <span className="admin-muted">Unsaved changes (Ctrl+S to save)</span>}
        </div>
        {id && LANGS.filter((l) => row[`${l}_enabled`]).map((l) => (
          <Link key={l} href={`/admin/posts/${id}/preview?lang=${l}`} target="_blank" className="btn btn-ghost btn-sm">
            Preview {l.toUpperCase()}
          </Link>
        ))}
        {live && !dirty && LANGS.filter((l) => row[`${l}_enabled`]).map((l) => (
          <a key={`v-${l}`} href={localeHref(l, `/blog/${row.slug}`)} target="_blank" rel="noopener noreferrer" className="admin-link">View {l.toUpperCase()}</a>
        ))}
        <button type="button" className="btn btn-primary" onClick={save} disabled={pending || !!uploading}>
          {pending ? 'Saving…' : row.status === 'draft' ? 'Save draft' : row.status === 'scheduled' ? 'Save & schedule' : 'Save & publish'}
        </button>
      </div>

    </div>
  );
}
