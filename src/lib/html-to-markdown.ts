/**
 * Pasted HTML (a web page, Google Docs, Word) → the Markdown the site renders.
 *
 * 1. Sanitise in a detached document: drop script/style/iframe/form…, keep
 *    only h2 h3 p strong em ul ol li a table thead tbody tr th td blockquote
 *    img (h1 → h2, h4–h6 → h3, b → strong, i → em; Google Docs/Word bold and
 *    italic spans become strong/em before their styles go). Every attribute
 *    goes except a[href] and img[src|alt]; on* handlers and javascript: links
 *    never survive. Links to www.starsolution.ai become relative.
 * 2. turndown with the GFM tables plugin; images become ::image blocks.
 * 3. A final pass removes any tag left, so the body is never stored as HTML.
 *
 * Runs in the browser (DOMParser). `parse` is injectable for tests.
 */
import TurndownService from 'turndown';
import { tables } from 'turndown-plugin-gfm';
import { attr } from './markdown';

const KEEP = new Set(['H2', 'H3', 'P', 'STRONG', 'EM', 'UL', 'OL', 'LI', 'A', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'BLOCKQUOTE', 'IMG', 'BR']);
const DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'FORM', 'NOSCRIPT', 'OBJECT', 'EMBED', 'SVG', 'CANVAS', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'HEAD', 'META', 'LINK', 'TITLE', 'TEMPLATE', 'VIDEO', 'AUDIO']);
const RENAME: Record<string, string> = { H1: 'H2', H4: 'H3', H5: 'H3', H6: 'H3', B: 'STRONG', I: 'EM', CAPTION: 'P' };

type Parse = (html: string) => Document;

/** Google's redirect wrapper (https://www.google.com/url?q=…) → the real URL; our own domain → a path. */
export function cleanHref(href: string): string | null {
  let h = href.trim();
  const g = h.match(/^https?:\/\/(?:www\.)?google\.[a-z.]+\/url\?(?:.*&)?q=([^&]+)/i);
  if (g) h = decodeURIComponent(g[1]);
  if (!/^(https?:|mailto:|tel:|\/|#)/i.test(h)) return null;
  const own = h.match(/^https?:\/\/(?:www\.)?starsolution\.ai(\/[^?#]*)?([?#].*)?$/i);
  if (own) return (own[1] || '/') + (own[2] ?? '');
  return h;
}

function rename(doc: Document, el: Element, tag: string): Element {
  const next = doc.createElement(tag);
  while (el.firstChild) next.appendChild(el.firstChild);
  el.replaceWith(next);
  return next;
}

function unwrap(el: Element) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}

export function sanitizeHtml(html: string, parse?: Parse): Document {
  const doc = (parse ?? ((s: string) => new DOMParser().parseFromString(s, 'text/html')))(html);
  const body = doc.body;

  // Depth-first, children before parents, over a static list.
  const all = Array.from(body.querySelectorAll('*')).reverse();
  for (let el of all) {
    const tag = el.tagName.toUpperCase();
    if (DROP.has(tag)) { el.remove(); continue; }

    // Bold/italic expressed as styles (Google Docs, Word) — read before styles go.
    const style = (el.getAttribute('style') ?? '').toLowerCase();
    if (tag === 'B' && /font-weight\s*:\s*(normal|[1-5]00)\b/.test(style)) { unwrap(el); continue; }
    if (tag === 'SPAN' || tag === 'FONT') {
      const bold = /font-weight\s*:\s*(bold|[6-9]00)\b/.test(style);
      const italic = /font-style\s*:\s*italic/.test(style);
      if (bold || italic) {
        let inner: Element = rename(doc, el, bold ? 'strong' : 'em');
        if (bold && italic) { const em = doc.createElement('em'); while (inner.firstChild) em.appendChild(inner.firstChild); inner.appendChild(em); }
        el = inner;
      } else { unwrap(el); continue; }
    }

    const target = RENAME[tag];
    if (target) el = rename(doc, el, target.toLowerCase());
    const now = el.tagName.toUpperCase();
    if (!KEEP.has(now)) { unwrap(el); continue; }

    // Attributes: only a[href] and img[src|alt].
    const href = now === 'A' ? el.getAttribute('href') : null;
    const src = now === 'IMG' ? el.getAttribute('src') : null;
    const alt = now === 'IMG' ? el.getAttribute('alt') : null;
    for (const a of Array.from(el.attributes)) el.removeAttribute(a.name);
    if (now === 'A') {
      const clean = href ? cleanHref(href) : null;
      if (clean) el.setAttribute('href', clean); else { unwrap(el); continue; }
    }
    if (now === 'IMG') {
      if (!src || !/^https?:\/\//i.test(src)) { el.remove(); continue; }
      el.setAttribute('src', src);
      el.setAttribute('alt', alt ?? '');
    }
  }

  // Paragraphs inside list items and table cells break Markdown lists/tables.
  for (const p of Array.from(body.querySelectorAll('li p, td p, th p'))) {
    if (p.nextSibling) p.appendChild(doc.createTextNode(' '));
    unwrap(p);
  }
  // GFM tables need a header row; Docs and Word tables usually have none.
  for (const table of Array.from(body.querySelectorAll('table'))) {
    if (table.querySelector('th')) continue;
    const first = table.querySelector('tr');
    if (!first) { table.remove(); continue; }
    for (const td of Array.from(first.children)) rename(doc, td, 'th');
    const thead = doc.createElement('thead');
    first.parentNode?.removeChild(first);
    thead.appendChild(first);
    table.insertBefore(thead, table.firstChild);
  }
  // Empty paragraphs and headings (Docs pastes plenty).
  for (const el of Array.from(body.querySelectorAll('p, h2, h3, strong, em'))) {
    if (!el.textContent?.trim() && !el.querySelector('img')) el.remove();
  }
  return doc;
}

export function htmlToMarkdown(html: string, parse?: Parse): string {
  const doc = sanitizeHtml(html, parse);
  const td = new TurndownService({
    headingStyle: 'atx', bulletListMarker: '-', emDelimiter: '*', strongDelimiter: '**', codeBlockStyle: 'fenced',
  });
  td.use(tables);
  // The site's Markdown reader does not unescape, so turndown's backslashes would show.
  td.escape = (s: string) => s;
  td.addRule('image', {
    filter: 'img',
    replacement: (_c, node) => {
      const el = node as HTMLElement;
      return `\n\n::image{src=${attr(el.getAttribute('src') ?? '')} alt=${attr(el.getAttribute('alt') ?? '')}}\n\n`;
    },
  });
  td.addRule('listItem', {
    filter: 'li',
    replacement: (content, node) => {
      const parent = node.parentNode as HTMLElement | null;
      const index = parent ? Array.prototype.indexOf.call(parent.children, node) + 1 : 1;
      const marker = parent?.nodeName === 'OL' ? `${index}. ` : '- ';
      return `${marker}${content.replace(/\s*\n+\s*/g, ' ').trim()}\n`;
    },
  });
  const md = td.turndown(doc.body.innerHTML)
    // Never store HTML: anything turndown kept as-is goes.
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/ /g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return md;
}
