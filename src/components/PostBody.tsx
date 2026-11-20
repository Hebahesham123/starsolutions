import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { Faq } from './Faq';
import { Icon } from './Icon';
import { Linked } from './Linked';
import { inlineText, parseMarkdown, splitFaq, type Block, type Inline } from '@/lib/markdown';
import { uniqueIds } from '@/lib/post-utils';
import { getDict, localeHref, type Locale } from '@/lib/i18n';

/** The paragraph look the posts have always had. */
const P_STYLE: React.CSSProperties = { fontSize: '15.5px', marginTop: '14px' };

/** A solution, automation or system a callout card can point at. */
export type ServiceCard = { href: string; title: string; summary?: string; group: string };
/** Keyed "<section>/<slug>", e.g. "systems/courier-system". */
export type ServiceLookup = Record<string, ServiceCard>;

type Directive = Extract<Block, { type: 'directive' }>;

const isExternal = (href: string) => /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?starsolution\.ai/i.test(href);

/** "https://youtu.be/ID", ".../watch?v=ID", ".../embed/ID", ".../shorts/ID" -> ID. */
export function youtubeId(src: string): string | null {
  const m = src.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/i);
  return m ? m[1] : null;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * A video that costs nothing until it is played. YouTube: the iframe is lazy
 * and starts as a `srcdoc` holding only the thumbnail and a play button, so no
 * YouTube script loads until the click (which swaps in the real player, with
 * autoplay). A file: <video preload="none">. Both sit in a fixed 16:9 box, so
 * nothing moves when they load.
 */
function Video({ d, label }: { d: Directive; label: string }) {
  const src = d.attrs.src ?? '';
  const caption = d.attrs.caption;
  const id = youtubeId(src);
  let player: React.ReactNode = null;
  if (id) {
    const embed = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    const doc = `<style>*{margin:0;padding:0}html,body{height:100%;overflow:hidden;background:#0B1220}a{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}span{position:relative;width:68px;height:48px;border-radius:14px;background:rgba(11,18,32,.78);color:#fff;font:26px/48px sans-serif;text-align:center}a:hover span{background:#3B82F6}</style><a href="${embed}" aria-label="${esc(label)}"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy"><span>&#9654;</span></a>`;
    player = (
      <iframe
        src={embed}
        srcDoc={doc}
        title={caption || label}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  } else if (/\.(mp4|webm|mov)(\?|$)/i.test(src)) {
    player = <video src={src} controls preload="none" playsInline poster={d.attrs.poster} aria-label={caption || label} />;
  } else if (src) {
    return <p className="section-sub" style={P_STYLE}><a href={src} className="inline-link" rel="noopener noreferrer" target="_blank">{caption || label}</a></p>;
  }
  if (!player) return null;
  return (
    <figure className="post-video">
      <div className="post-video-box">{player}</div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

function Figure({ d }: { d: Directive }) {
  const { src, alt = '', caption } = d.attrs;
  if (!src) return null;
  const width = Number(d.attrs.width);
  const height = Number(d.attrs.height);
  return (
    <figure className="post-figure">
      {width > 0 && height > 0 ? (
        <Image src={src} alt={alt} width={width} height={height} sizes="(min-width: 1024px) 680px, 100vw" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/**
 * A blog post's body.
 *
 * `body` is either the original list of plain paragraphs, rendered exactly as
 * before, or one Markdown string (headings, lists, bold, links, tables, and
 * the reusable blocks described in lib/markdown.ts). A Markdown body's
 * "Frequently asked questions" section, if it has one, is lifted out and
 * rendered with the same Faq component as the solution pages, which also
 * writes its FAQPage JSON-LD. Plain text still goes through Linked, so the
 * phrases in internal-links.json keep becoming links; text already inside a
 * Markdown link is left alone. Every H2 gets an id, which the table of
 * contents links to.
 */
export function PostBody({
  body, locale, path, services = {}, whatsapp,
}: {
  body: string | string[];
  locale: Locale;
  /** Locale-free path, e.g. '/blog/my-post'. */
  path: string;
  /** What ::callout blocks can link to. */
  services?: ServiceLookup;
  /** WhatsApp link for ::cta{type="whatsapp"}. */
  whatsapp?: string;
}) {
  if (Array.isArray(body)) {
    return (
      <>
        {body.map((para) => (
          <p key={para.slice(0, 24)} className="section-sub" style={P_STYLE}>
            <Linked text={para} locale={locale} path={path} />
          </p>
        ))}
      </>
    );
  }

  const t = getDict(locale);
  const faqHeadings = [getDict('en')('detail.faq'), getDict('ar')('detail.faq')];
  const parsed = parseMarkdown(body);
  // Ids in document order, the same order lib/post-utils bodyHeadings() uses.
  const h2s = parsed.filter((b) => b.type === 'h2');
  const ids = uniqueIds(h2s.map((b) => (b as { text: string }).text));
  const idOf = new Map<Block, string>(h2s.map((b, i) => [b, ids[i]]));
  const { before, title, faq, after } = splitFaq(parsed, faqHeadings);

  const inline = (nodes: Inline[], linked: boolean, key = ''): React.ReactNode[] =>
    nodes.map((n, i) => {
      const k = `${key}${i}`;
      if (n.type === 'text') {
        return linked ? <Linked key={k} text={n.text} locale={locale} path={path} /> : <React.Fragment key={k}>{n.text}</React.Fragment>;
      }
      if (n.type === 'bold') return <strong key={k}>{inline(n.children, linked, `${k}-`)}</strong>;
      if (isExternal(n.href)) {
        return <a key={k} href={n.href} className="inline-link" rel="noopener noreferrer" target="_blank">{inline(n.children, false, `${k}-`)}</a>;
      }
      return <Link key={k} href={n.href} className="inline-link">{inline(n.children, false, `${k}-`)}</Link>;
    });

  const directive = (d: Directive, key: number): React.ReactNode => {
    switch (d.name) {
      case 'callout': {
        const card = services[`${d.attrs.section}/${d.attrs.slug}`];
        if (!card) return null;
        return (
          <Link key={key} href={card.href} className="post-callout">
            <span className="post-callout-group">{card.group}</span>
            <span className="post-callout-title">{card.title}</span>
            {(d.attrs.text || card.summary) && <span className="post-callout-text">{d.attrs.text || card.summary}</span>}
            <span className="post-callout-more">{t('cta.readMore')} <Icon name="arrow" /></span>
          </Link>
        );
      }
      case 'cta': {
        const wa = d.attrs.type === 'whatsapp';
        const href = wa ? whatsapp : localeHref(locale, '/contact');
        if (!href) return null;
        return (
          <div key={key} className="post-inline-cta">
            <p>{d.attrs.text || t('post.asideBody')}</p>
            {wa ? (
              <a href={href} className="btn btn-ghost" rel="noopener noreferrer" target="_blank">
                <Icon name="whatsapp" className="h-5 w-5 text-[#25D366]" /> {t('cta.whatsapp')}
              </a>
            ) : (
              <Link href={href} className="btn btn-primary">{t('cta.audit')}</Link>
            )}
          </div>
        );
      }
      case 'video':
        return <Video key={key} d={d} label={t('post.playVideo')} />;
      default:
        return null;
    }
  };

  const blocks = (list: Block[]) => {
    const out: React.ReactNode[] = [];
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      switch (b.type) {
        case 'h2': out.push(<h2 key={i} id={idOf.get(b)}>{b.text}</h2>); break;
        case 'h3': out.push(<h3 key={i}>{b.text}</h3>); break;
        case 'hr': out.push(<hr key={i} />); break;
        case 'p': out.push(<p key={i} className="section-sub" style={P_STYLE}>{inline(b.inline, true)}</p>); break;
        case 'directive': {
          if (b.name !== 'image') { out.push(directive(b, i)); break; }
          // Consecutive images: one figure, or a gallery of several.
          const run: Directive[] = [];
          while (i < list.length && list[i].type === 'directive' && (list[i] as Directive).name === 'image') run.push(list[i++] as Directive);
          i--;
          out.push(run.length === 1
            ? <Figure key={i} d={run[0]} />
            : <div key={i} className="post-gallery" role="group" aria-label={t('post.gallery')}>{run.map((d, j) => <Figure key={j} d={d} />)}</div>);
          break;
        }
        case 'table':
          // The wrapper scrolls sideways on a narrow phone instead of letting
          // a wide table push the page wider than the screen.
          out.push(
            <div key={i} className="post-table-wrap" role="region" aria-label={b.head.map((c) => inlineText(c)).join(' / ')} tabIndex={0}>
              <table className="post-table">
                <thead>
                  <tr>{b.head.map((c, j) => <th key={j} scope="col">{inline(c, false)}</th>)}</tr>
                </thead>
                <tbody>
                  {b.rows.map((row, r) => (
                    <tr key={r}>{row.map((c, j) => <td key={j}>{inline(c, true)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>,
          );
          break;
        default: {
          const List = b.type === 'ol' ? 'ol' : 'ul';
          out.push(
            <List key={i} className={`post-list post-${b.type}`}>
              {b.items.map((item, j) => <li key={j}>{inline(item, true)}</li>)}
            </List>,
          );
        }
      }
    }
    return out;
  };

  return (
    <div className="post-md">
      {blocks(before)}
      <Faq items={faq} locale={locale} path={path} embedded title={title} />
      {blocks(after)}
    </div>
  );
}

/** Inline Markdown (bold, links) for one short line: summary bullets, CTA text. */
export function InlineMd({ text, locale, path }: { text: string; locale: Locale; path: string }) {
  const block = parseMarkdown(text)[0];
  if (!block || block.type !== 'p') return <>{text}</>;
  const render = (nodes: Inline[], key = ''): React.ReactNode[] =>
    nodes.map((n, i) => {
      const k = `${key}${i}`;
      if (n.type === 'text') return <Linked key={k} text={n.text} locale={locale} path={path} />;
      if (n.type === 'bold') return <strong key={k}>{render(n.children, `${k}-`)}</strong>;
      return isExternal(n.href)
        ? <a key={k} href={n.href} className="inline-link" rel="noopener noreferrer" target="_blank">{inlineText(n.children)}</a>
        : <Link key={k} href={n.href} className="inline-link">{inlineText(n.children)}</Link>;
    });
  return <>{render(block.inline)}</>;
}
