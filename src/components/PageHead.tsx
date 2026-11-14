import type * as React from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { Reveal } from './Reveal';
import { JsonLd, breadcrumbs } from '@/lib/schema';

export function PageHead({
  eyebrow, title, lede, crumbs, icon, tone, aside, byline,
}: {
  eyebrow?: string;
  title: string;
  /** Directly under the title, above the lede: a post's author. */
  byline?: React.ReactNode;
  lede?: React.ReactNode;
  crumbs?: { href?: string; label: string }[];
  /** Draws the entry's own mark above the title, so a detail page opens with the
   *  same icon and colour as the card that was clicked to reach it. */
  icon?: string;
  tone?: string;
  /** Sits beside the title on a desktop and under the lede on a phone. The
   *  detail pages put their spec panel here: the head was half a screen of
   *  empty space to the right of the words, and the panel it holds is content
   *  the body no longer has to carry. */
  aside?: React.ReactNode;
}) {
  return (
    <>
    <header
      className={`page-head${tone ? ' has-tone' : ''}`}
      style={tone ? ({ ['--tone' as string]: tone }) : undefined}
    >
      <div className="starfield starfield-dim" aria-hidden="true">
        {Array.from({ length: 22 }, (_, i) => (
          <span
            key={i}
            className={`star${i % 4 === 0 ? ' is-tw' : ''}`}
            style={{
              left: `${((i * 43.3) % 100).toFixed(2)}%`,
              top: `${((i * 29.7) % 100).toFixed(2)}%`,
              width: '2px', height: '2px',
              ['--o' as string]: '0.3',
              ['--tw' as string]: `${(4 + (i % 5)).toFixed(1)}s`,
            }}
          />
        ))}
      </div>
      <div className={`page-head-inner${aside ? ' has-aside' : ''}`}>
        {crumbs && (
          <nav className="crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={c.label} className="contents">
                {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
                {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
              </span>
            ))}
          </nav>
        )}
        {/* First screen of every inner page, and the lede is usually its LCP
            element: eager so it does not wait for JavaScript, no fade so it is
            visible from the first paint. */}
        <Reveal className="page-head-copy" eager fade={false}>
          {icon && <span className="head-mark" aria-hidden="true"><Icon name={icon} /></span>}
          {eyebrow && <p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" /> {eyebrow}</p>}
          <h1 className="page-title">{title}</h1>
          {byline}
          {lede && <p className="page-lede">{lede}</p>}
        </Reveal>
        {aside && <Reveal className="page-head-aside" delay={0.1} eager fade={false}>{aside}</Reveal>}
      </div>
    </header>
    {/* Breadcrumb structured data for Google, from the same crumbs drawn
        above. A script renders nothing, so the page looks the same. */}
    {crumbs && crumbs.length > 1 && <JsonLd data={breadcrumbs(crumbs)} />}
    </>
  );
}
