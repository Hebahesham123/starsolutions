import Link from 'next/link';
import * as React from 'react';
import links from '@/data/internal-links.json';
import { localeHref, type Locale } from '@/lib/i18n';

type Anchor = { text: string; href: string };
const LINKS = links as unknown as Record<Locale, Record<string, Anchor[]>>;

/**
 * Page text with its internal links (src/data/internal-links.json) turned into
 * real links, for Google and for readers.
 *
 * The words are matched in the text as it renders, so the stored copy — the
 * JSON seed or the Supabase row, whichever is live — never carries markup:
 * cards, meta descriptions and schema keep using the plain text. A phrase that
 * is no longer in the text is simply skipped. Each target is linked once per
 * block, and never to the page itself.
 *
 * `path` is the page's path without the /ar prefix, e.g. '/solutions/ai-smart-ads'.
 */
export function Linked({ text, locale, path }: { text: string; locale: Locale; path: string }) {
  const anchors = (LINKS[locale]?.[path] ?? []).filter((a) => a.href !== path && text.includes(a.text));
  if (anchors.length === 0) return <>{text}</>;

  // Earliest match first; drop any that overlap one already taken.
  const hits = anchors
    .map((a) => ({ ...a, at: text.indexOf(a.text) }))
    .sort((x, y) => x.at - y.at)
    .filter((h, i, all) => all.slice(0, i).every((p) => p.at + p.text.length <= h.at));

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  hits.forEach((h, i) => {
    if (h.at > cursor) parts.push(text.slice(cursor, h.at));
    parts.push(
      <Link key={i} href={localeHref(locale, h.href)} className="inline-link">
        {h.text}
      </Link>,
    );
    cursor = h.at + h.text.length;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}
