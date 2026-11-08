import Link from 'next/link';
import * as React from 'react';
import { Faq } from './Faq';
import { Linked } from './Linked';
import { inlineText, parseMarkdown, splitFaq, type Block, type Inline } from '@/lib/markdown';
import { getDict, type Locale } from '@/lib/i18n';

/** The paragraph look the posts have always had. */
const P_STYLE: React.CSSProperties = { fontSize: '15.5px', marginTop: '14px' };

/**
 * A blog post's body.
 *
 * `body` is either the original list of plain paragraphs, rendered exactly as
 * before, or one Markdown string (headings, lists, bold, links). A Markdown
 * post's "Frequently asked questions" section is lifted out and rendered with
 * the same Faq component as the solution pages, which also writes its FAQPage
 * JSON-LD. Plain text still goes through Linked, so the phrases in
 * internal-links.json keep becoming links; text already inside a Markdown
 * link is left alone.
 */
export function PostBody({
  body, locale, path,
}: {
  body: string | string[];
  locale: Locale;
  /** Locale-free path, e.g. '/blog/my-post'. */
  path: string;
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

  const faqHeadings = [getDict('en')('detail.faq'), getDict('ar')('detail.faq')];
  const { before, title, faq, after } = splitFaq(parseMarkdown(body), faqHeadings);

  const inline = (nodes: Inline[], linked: boolean, key = ''): React.ReactNode[] =>
    nodes.map((n, i) => {
      const k = `${key}${i}`;
      if (n.type === 'text') {
        return linked ? <Linked key={k} text={n.text} locale={locale} path={path} /> : <React.Fragment key={k}>{n.text}</React.Fragment>;
      }
      if (n.type === 'bold') return <strong key={k}>{inline(n.children, linked, `${k}-`)}</strong>;
      return <Link key={k} href={n.href} className="inline-link">{inline(n.children, false, `${k}-`)}</Link>;
    });

  const blocks = (list: Block[]) =>
    list.map((b, i) => {
      switch (b.type) {
        case 'h2': return <h2 key={i}>{b.text}</h2>;
        case 'h3': return <h3 key={i}>{b.text}</h3>;
        case 'hr': return <hr key={i} />;
        case 'p': return <p key={i} className="section-sub" style={P_STYLE}>{inline(b.inline, true)}</p>;
        case 'table':
          // The wrapper scrolls sideways on a narrow phone instead of letting
          // a wide table push the page wider than the screen.
          return (
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
            </div>
          );
        default: {
          const List = b.type === 'ol' ? 'ol' : 'ul';
          return (
            <List key={i} className={`post-list post-${b.type}`}>
              {b.items.map((item, j) => <li key={j}>{inline(item, true)}</li>)}
            </List>
          );
        }
      }
    });

  return (
    <div className="post-md">
      {blocks(before)}
      <Faq items={faq} locale={locale} path={path} embedded title={title} />
      {blocks(after)}
    </div>
  );
}
