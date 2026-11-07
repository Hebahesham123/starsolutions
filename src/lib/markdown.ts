/**
 * A small Markdown reader for blog post bodies.
 *
 * Covers what the posts use and nothing more: "## " and "### " headings,
 * "- " and "1. " lists, paragraphs, "---" rules, **bold** and [text](/path)
 * links. It returns plain data, not HTML, so the page builds real elements
 * (and Next.js links) from it and nothing is ever injected as markup.
 */

export type Inline =
  | { type: 'text'; text: string }
  | { type: 'bold'; children: Inline[] }
  | { type: 'link'; href: string; children: Inline[] };

export type Block =
  | { type: 'h2' | 'h3'; text: string }
  | { type: 'p'; inline: Inline[] }
  | { type: 'ul' | 'ol'; items: Inline[][] }
  | { type: 'hr' };

/** **bold** and [text](href), in any order; bold may contain a link and vice versa. */
export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (let m = re.exec(src); m; m = re.exec(src)) {
    if (m.index > last) out.push({ type: 'text', text: src.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ type: 'bold', children: parseInline(m[1]) });
    else out.push({ type: 'link', href: m[3], children: parseInline(m[2]) });
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push({ type: 'text', text: src.slice(last) });
  return out;
}

export function parseMarkdown(src: string): Block[] {
  const blocks: Block[] = [];
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  let para: string[] = [];
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flush = () => {
    if (para.length) blocks.push({ type: 'p', inline: parseInline(para.join(' ')) });
    para = [];
    if (list) blocks.push({ type: list.type, items: list.items.map(parseInline) });
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    let m: RegExpMatchArray | null;
    if (!line) { flush(); continue; }
    if (/^-{3,}$/.test(line)) { flush(); blocks.push({ type: 'hr' }); continue; }
    if ((m = line.match(/^(#{2,3})\s+(.*)$/))) {
      flush();
      blocks.push({ type: m[1].length === 2 ? 'h2' : 'h3', text: m[2] });
      continue;
    }
    if ((m = line.match(/^(?:([-*])|\d+[.)])\s+(.*)$/))) {
      const type = m[1] ? 'ul' : 'ol';
      if (para.length) { blocks.push({ type: 'p', inline: parseInline(para.join(' ')) }); para = []; }
      if (list && list.type !== type) { blocks.push({ type: list.type, items: list.items.map(parseInline) }); list = null; }
      list ??= { type, items: [] };
      list.items.push(m[2]);
      continue;
    }
    if (list) { blocks.push({ type: list.type, items: list.items.map(parseInline) }); list = null; }
    para.push(line);
  }
  flush();
  return blocks;
}

/** The words a reader sees in an inline run. */
export function inlineText(nodes: Inline[]): string {
  return nodes.map((n) => (n.type === 'text' ? n.text : inlineText(n.children))).join('');
}

/**
 * Splits out a "## <FAQ heading>" section: each "### " question and the
 * paragraphs under it until the next question, h2 or rule. Returns the
 * blocks before it, the questions, and the blocks after it.
 */
export function splitFaq(blocks: Block[], headings: string[]) {
  const start = blocks.findIndex((b) => b.type === 'h2' && headings.includes(b.text.trim()));
  if (start === -1) return { before: blocks, faq: [] as { q: string; a: string }[], after: [] as Block[] };

  const faq: { q: string; a: string }[] = [];
  let i = start + 1;
  for (; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === 'h2' || b.type === 'hr') break;
    if (b.type === 'h3') faq.push({ q: b.text, a: '' });
    else if (b.type === 'p' && faq.length) {
      const last = faq[faq.length - 1];
      last.a = last.a ? `${last.a} ${inlineText(b.inline)}` : inlineText(b.inline);
    }
  }
  return { before: blocks.slice(0, start), faq, after: blocks.slice(i) };
}
