'use client';

import * as React from 'react';
import { attr } from '@/lib/markdown';
import type { PostImage } from '@/lib/post-utils';
import type { ServiceLookup } from '@/components/PostBody';

type Panel = null | 'link' | 'callout' | 'video' | 'image' | 'cta';

/**
 * The post body editor: a plain Markdown textarea with a toolbar, an "Insert
 * block" panel for the reusable blocks, and an optional live preview (passed
 * in as `preview`, rendered with the real PostBody).
 */
export function MarkdownField({
  id, value, onChange, dir, services, onUpload, preview, rows = 22,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  dir: 'ltr' | 'rtl';
  services: ServiceLookup;
  onUpload: (file: File) => Promise<PostImage | null>;
  preview?: React.ReactNode;
  rows?: number;
}) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const [panel, setPanel] = React.useState<Panel>(null);
  const [showPreview, setShowPreview] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [f, setF] = React.useState<Record<string, string>>({});
  const field = (k: string) => f[k] ?? '';
  const setField = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));
  const fileRef = React.useRef<HTMLInputElement>(null);

  /** Replaces the selection with `text` and puts the cursor/selection at [selStart, selEnd] within it. */
  const replace = (text: string, selStart = text.length, selEnd = selStart) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    onChange(value.slice(0, s) + text + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + selStart, s + selEnd);
    });
  };

  const selected = () => {
    const el = ref.current;
    return el ? value.slice(el.selectionStart, el.selectionEnd) : '';
  };

  const wrap = (mark: string, placeholder: string) => {
    const text = selected() || placeholder;
    replace(`${mark}${text}${mark}`, mark.length, mark.length + text.length);
  };

  /** Prefixes every selected line (or the current line). */
  const prefixLines = (prefix: (i: number) => string) => {
    const el = ref.current;
    if (!el) return;
    const start = value.lastIndexOf('\n', el.selectionStart - 1) + 1;
    const endIdx = value.indexOf('\n', el.selectionEnd);
    const end = endIdx === -1 ? value.length : endIdx;
    const lines = value.slice(start, end).split('\n')
      .map((l, i) => prefix(i) + l.replace(/^(#{2,3}\s+|[-*]\s+|\d+[.)]\s+)/, ''));
    const text = lines.join('\n');
    onChange(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start, start + text.length); });
  };

  /** Inserts a block on its own lines at the cursor. */
  const insertBlock = (block: string) => {
    const el = ref.current;
    const at = el ? el.selectionEnd : value.length;
    const before = value.slice(0, at);
    const lead = before === '' || before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
    const text = `${lead}${block}\n\n`;
    onChange(before + text + value.slice(at));
    setPanel(null);
    setF({});
    requestAnimationFrame(() => { if (el) { el.focus(); el.setSelectionRange(at + text.length, at + text.length); } });
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const lines: string[] = [];
    for (const file of Array.from(files)) {
      const image = await onUpload(file);
      if (image) {
        lines.push(`::image{src=${attr(image.src)} alt=${attr(field('alt'))} caption=${attr(field('caption'))} width="${image.width}" height="${image.height}"}`);
      }
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
    if (lines.length) insertBlock(lines.join('\n'));
  };

  const serviceKeys = Object.keys(services).sort();

  return (
    <div className="md-field">
      <div className="md-toolbar" role="toolbar" aria-label="Formatting">
        <button type="button" onClick={() => prefixLines(() => '## ')} title="Heading 2">H2</button>
        <button type="button" onClick={() => prefixLines(() => '### ')} title="Heading 3">H3</button>
        <button type="button" onClick={() => wrap('**', 'bold text')} title="Bold"><strong>B</strong></button>
        <button type="button" onClick={() => prefixLines(() => '- ')} title="Bulleted list">• List</button>
        <button type="button" onClick={() => prefixLines((i) => `${i + 1}. `)} title="Numbered list">1. List</button>
        <button type="button" onClick={() => insertBlock('| Column | Column |\n| --- | --- |\n| Cell | Cell |')} title="Table">Table</button>
        <button type="button" onClick={() => { setF({ text: selected() }); setPanel(panel === 'link' ? null : 'link'); }} title="Link">Link</button>
        <span className="md-sep" aria-hidden="true" />
        <span className="md-label">Insert:</span>
        <button type="button" className={panel === 'callout' ? 'is-on' : ''} onClick={() => setPanel(panel === 'callout' ? null : 'callout')}>Callout</button>
        <button type="button" className={panel === 'video' ? 'is-on' : ''} onClick={() => setPanel(panel === 'video' ? null : 'video')}>Video</button>
        <button type="button" className={panel === 'image' ? 'is-on' : ''} onClick={() => setPanel(panel === 'image' ? null : 'image')}>Image / gallery</button>
        <button type="button" className={panel === 'cta' ? 'is-on' : ''} onClick={() => setPanel(panel === 'cta' ? null : 'cta')}>Inline CTA</button>
        {preview && (
          <label className="md-preview-toggle">
            <input type="checkbox" checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} /> Live preview
          </label>
        )}
      </div>

      {panel && (
        <div className="md-panel">
          {panel === 'link' && (
            <>
              <input type="text" placeholder="Link text" value={field('text')} onChange={(e) => setField('text', e.target.value)} dir={dir} />
              <input type="text" placeholder="/solutions/… or https://…" value={field('href')} onChange={(e) => setField('href', e.target.value)} dir="ltr" />
              <button type="button" className="btn btn-primary btn-sm" disabled={!field('href') || !field('text')}
                onClick={() => { const t = field('text'); replace(`[${t}](${field('href')})`); setPanel(null); setF({}); }}>Insert link</button>
              <p className="admin-help">Internal links start with / (Arabic pages with /ar/…). At least 3 internal links per post.</p>
            </>
          )}
          {panel === 'callout' && (
            <>
              <select value={field('target')} onChange={(e) => setField('target', e.target.value)} className="admin-select">
                <option value="">Choose a page…</option>
                {serviceKeys.map((k) => <option key={k} value={k}>{services[k].group}: {services[k].title}</option>)}
              </select>
              <input type="text" placeholder="Optional line (defaults to the page's summary)" value={field('text')} onChange={(e) => setField('text', e.target.value)} dir={dir} />
              <button type="button" className="btn btn-primary btn-sm" disabled={!field('target')}
                onClick={() => {
                  const [section, slug] = field('target').split('/');
                  insertBlock(`::callout{section="${section}" slug="${slug}"${field('text') ? ` text=${attr(field('text'))}` : ''}}`);
                }}>Insert callout</button>
            </>
          )}
          {panel === 'video' && (
            <>
              <input type="text" placeholder="YouTube link or .mp4 URL" value={field('src')} onChange={(e) => setField('src', e.target.value)} dir="ltr" />
              <input type="text" placeholder="Caption" value={field('caption')} onChange={(e) => setField('caption', e.target.value)} dir={dir} />
              <button type="button" className="btn btn-primary btn-sm" disabled={!field('src')}
                onClick={() => insertBlock(`::video{src=${attr(field('src'))} caption=${attr(field('caption'))}}`)}>Insert video</button>
              <p className="admin-help">Loads nothing until the reader presses play.</p>
            </>
          )}
          {panel === 'image' && (
            <>
              <input type="text" placeholder="Alt text (required)" value={field('alt')} onChange={(e) => setField('alt', e.target.value)} dir={dir} />
              <input type="text" placeholder="Caption (optional)" value={field('caption')} onChange={(e) => setField('caption', e.target.value)} dir={dir} />
              <input ref={fileRef} type="file" accept="image/*" multiple disabled={busy} onChange={(e) => upload(e.target.files)} />
              <p className="admin-help">
                {busy ? 'Uploading and converting to WebP…' : 'Converted to WebP (max 1600px) with its size stored. Pick several files for a gallery; edit each line\'s alt and caption afterwards.'}
              </p>
            </>
          )}
          {panel === 'cta' && (
            <>
              <select value={field('type') || 'audit'} onChange={(e) => setField('type', e.target.value)} className="admin-select">
                <option value="audit">Free audit</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
              <input type="text" placeholder="Optional line above the button" value={field('text')} onChange={(e) => setField('text', e.target.value)} dir={dir} />
              <button type="button" className="btn btn-primary btn-sm"
                onClick={() => insertBlock(`::cta{type="${field('type') || 'audit'}"${field('text') ? ` text=${attr(field('text'))}` : ''}}`)}>Insert CTA</button>
            </>
          )}
        </div>
      )}

      <div className={`md-split${preview && showPreview ? ' has-preview' : ''}`}>
        <textarea
          id={id}
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          dir={dir}
          className="admin-mono md-input"
          spellCheck
        />
        {preview && showPreview && <div className="md-preview" dir={dir} lang={dir === 'rtl' ? 'ar' : 'en'}>{preview}</div>}
      </div>
    </div>
  );
}
