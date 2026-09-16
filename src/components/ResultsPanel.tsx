'use client';

import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import * as React from 'react';
import { Icon } from './Icon';
import { Counter } from './Counter';
import { StatArt } from './ui/StatArt';
import type { Chart, Figure } from '@/lib/types';

/**
 * Proven results. Each figure is a switch: clicking one repaints the chart with
 * that metric. Bar heights come from the values, never hand-set percentages.
 */
export function ResultsPanel({ charts, figures }: { charts: Record<string, Chart>; figures: Figure[] }) {
  const [metric, setMetric] = React.useState('revenue');
  const chart = charts[metric] ?? charts.revenue;
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduce = useReducedMotion();

  const max = Math.max(...chart.bars.map((b) => b.val)) || 1;
  const select = (key: string) => setMetric((cur) => (cur === key ? 'revenue' : key));

  /* Seven figures is a tall block on a phone — three rows of tiles under a
     chart that is already most of a screen. Three are shown and the rest wait
     behind a button. Collapsing is a phone-width concern only: the CSS hides
     the overflow below 640px and the button with it, so a desktop renders the
     full grid whatever this says. */
  const [showAll, setShowAll] = React.useState(false);
  const SHOWN = 3;
  const hidden = Math.max(0, figures.length - SHOWN);

  return (
    <div className={`results-panel is-lit${inView ? ' is-drawn' : ''}`} id="resultsPanel" ref={ref}>
      <figure className="rp-chart">
        {/* The sweep across the top corner. Purely decorative, and the one
            place in this panel with any weight to it — the panel is otherwise
            a white box, and the reference puts a ribbon here to stop the
            headline floating on nothing. */}
        <svg className="rp-ribbon" viewBox="0 0 320 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="rpRibbonA" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
              <stop offset="45%" stopColor="var(--accent)" stopOpacity=".5" />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity=".75" />
            </linearGradient>
            <linearGradient id="rpRibbonB" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity="0" />
              <stop offset="60%" stopColor="var(--brand)" stopOpacity=".38" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity=".5" />
            </linearGradient>
          </defs>
          <path d="M0 104C86 104 132 52 196 26 244 6 286 0 320 0v22c-34 0-72 8-116 28-62 28-108 76-204 76Z" fill="url(#rpRibbonA)" />
          <path d="M44 120C126 120 168 66 232 40 272 24 300 18 320 18" fill="none" stroke="url(#rpRibbonB)" strokeWidth="2.5" />
        </svg>
        <figcaption>
          <AnimatePresence mode="wait">
            <motion.div
              key={metric}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              <p className="rp-kicker">{chart.kicker}</p>
              <p className="rp-head">
                <Counter
                  className="rp-num"
                  value={chart.count}
                  decimals={chart.decimals ?? 0}
                  prefix={chart.prefix ?? ''}
                  suffix={chart.suffix ?? ''}
                  runKey={metric}
                />
                <span className="rp-head-label">{chart.label}</span>
              </p>
              <p className="rp-note">
                <Icon name="revenue" className="rp-note-icon" />
                <span>{chart.note}</span>
              </p>
            </motion.div>
          </AnimatePresence>
        </figcaption>

        <div
          className="rp-plot"
          role="img"
          aria-label={`${chart.kicker}: ${chart.bars.map((b) => `${b.cap} ${b.text}`).join(', ')}`}
        >
          <span className="rp-line" style={{ ['--t' as string]: '12%' }} />
          <span className="rp-line" style={{ ['--t' as string]: '40%' }} />
          <span className="rp-line" style={{ ['--t' as string]: '68%' }} />

          {/* A trace of the same movement the two bars describe, drawn across
              the whole plot so the pair reads as two points on a climb rather
              than as two unrelated columns. Stretched to the plot with
              preserveAspectRatio="none": it is a gesture, not a measurement,
              and the bars are the measurement. */}
          <svg className="rp-trace" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path d="M4 44C30 42 46 30 96 14" fill="none" stroke="currentColor" strokeWidth=".9" vectorEffect="non-scaling-stroke" />
          </svg>
          {/* On the curve, not near it: these are the same coordinates as the
              path above, read off it and converted to percentages of the same
              box. */}
          <span className="rp-trace-dot" style={{ ['--x' as string]: '4%', ['--y' as string]: '73.3%' }} />
          <span className="rp-trace-dot" style={{ ['--x' as string]: '48%', ['--y' as string]: '50%' }} />
          <span className="rp-trace-dot" style={{ ['--x' as string]: '96%', ['--y' as string]: '23.3%' }} />

          {chart.bars.map((bar, i) => {
            const solo = chart.bars.length === 1;
            const after = !bar.ghost && (solo || i === chart.bars.length - 1);
            const pct = Math.max(6, Math.round((bar.val / max) * 100));
            return (
              <div
                key={`${metric}-${bar.cap}`}
                className={`rp-col${after ? ' rp-col-after' : ''}${bar.ghost ? ' rp-col-ghost' : ''}${solo ? ' rp-col-solo' : ''}`}
              >
                <span className="rp-val">{bar.text}</span>
                <motion.span
                  className="rp-bar"
                  style={{ ['--h' as string]: `${pct}%`, transformOrigin: 'bottom' }}
                  initial={reduce ? false : { scaleY: 0 }}
                  animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 0.95, delay: i * 0.18, ease: [0.16, 0.84, 0.3, 1] }}
                />
                <span className="rp-cap">{bar.cap}</span>
              </div>
            );
          })}
        </div>
      </figure>

      <div className={`rp-tiles${showAll ? ' is-open' : ''}`}>
        {figures.map((f, i) => {
          const on = metric === f.metric;
          /* Hidden tiles are hidden from the keyboard too, or tabbing walks
             through six things nobody can see. */
          const folded = !showAll && i >= SHOWN;
          return (
            <article
              key={f.metric}
              className={`rt${on ? ' is-active' : ''}${folded ? ' is-folded' : ''}`}
              data-metric={f.metric}
              role="button"
              tabIndex={folded ? -1 : 0}
              aria-pressed={on}
              onClick={() => select(f.metric)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(f.metric); }
              }}
            >
              <span className="rt-icon"><Icon name={f.icon} /></span>
              <StatArt name={f.metric} />
              {f.metric === 'adspend' && <span className="rt-tag">save</span>}
              <p className="rt-num">
                <Counter value={f.count} decimals={f.decimals ?? 0} prefix={f.prefix ?? ''} suffix={f.suffix ?? ''} />
              </p>
              <p className="rt-label">{f.label}</p>
              <p className="rt-sub">{f.sub}</p>
              <span className="rt-hint">View chart</span>
            </article>
          );
        })}
      </div>

      {hidden > 0 && (
        <button type="button" className="rp-more" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
          {showAll ? 'Show less' : `Show ${hidden} more`}
          <Icon name="arrow" />
        </button>
      )}
    </div>
  );
}
