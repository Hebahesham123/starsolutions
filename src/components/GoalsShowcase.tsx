'use client';

import * as React from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { GoalMotif } from './ui/GoalMotif';
import type { Entry } from '@/lib/types';

/**
 * The goals, as one card you scroll through.
 *
 * Replaces the 2x2 grid. The card is pinned while the section scrolls past it,
 * and the picture and the copy swap as each goal comes up, so the reader takes
 * one in at a time at full size instead of comparing four small tiles.
 *
 * Progress is read from the section's own position rather than from a scroll
 * listener counting pixels, so it stays correct after a resize, a font swap or
 * a route transition — anything that moves the section without scrolling.
 *
 * Under prefers-reduced-motion the whole mechanism is dropped and every goal
 * renders as a plain stacked card. Pinning the viewport and swapping content
 * under the reader is exactly what that setting asks you not to do.
 */
export function GoalsShowcase({ goals }: { goals: Entry[] }) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const [reduce, setReduce] = React.useState(false);

  // Read as state, not via useReducedMotion, so the server and the first client
  // render agree: both start false and the effect corrects it.
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduce(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  React.useEffect(() => {
    if (reduce) return;
    const stage = stageRef.current;
    if (!stage) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const r = stage.getBoundingClientRect();
      // Distance the section travels while the card stays pinned.
      const travel = r.height - window.innerHeight;
      if (travel <= 0) return;
      const passed = Math.min(Math.max(-r.top, 0), travel);
      const p = passed / travel;
      // Split the travel into equal bands, one per goal.
      const next = Math.min(goals.length - 1, Math.floor(p * goals.length));
      setActive((cur) => (cur === next ? cur : next));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [goals.length, reduce]);

  /** Jump to a goal's band — the dots are real controls, not just an indicator. */
  const goTo = (i: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const travel = stage.offsetHeight - window.innerHeight;
    const top = stage.offsetTop + (travel * (i + 0.5)) / goals.length;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  if (reduce) {
    return (
      <div className="gs-plain">
        {goals.map((g) => (
          <Link key={g.id} href={`/goals/${g.slug}`} className="gs-plain-card" style={{ ['--tone' as string]: g.tone }}>
            <Visual goal={g} />
            <div className="gs-copy">
              <Head goal={g} />
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div
      className="gs-stage"
      ref={stageRef}
      style={{ ['--n' as string]: goals.length }}
    >
      <div className="gs-sticky">
        <article className="gs-card" style={{ ['--tone' as string]: goals[active]?.tone }}>
          <div className="gs-visual">
            {goals.map((g, i) => (
              <div
                key={g.id}
                className={`gs-shot${i === active ? ' is-on' : ''}`}
                style={{ ['--tone' as string]: g.tone }}
                aria-hidden={i !== active}
              >
                <Visual goal={g} />
              </div>
            ))}
          </div>

          <div className="gs-copy">
            {goals.map((g, i) => (
              <div
                key={g.id}
                className={`gs-text${i === active ? ' is-on' : ''}`}
                aria-hidden={i !== active}
              >
                <Head goal={g} />
              </div>
            ))}

            <ol className="gs-dots" aria-label="Goals">
              {goals.map((g, i) => (
                <li key={g.id}>
                  <button
                    type="button"
                    className={i === active ? 'is-on' : undefined}
                    aria-current={i === active ? 'true' : undefined}
                    onClick={() => goTo(i)}
                  >
                    <span className="sr-only">{g.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </article>
      </div>
    </div>
  );
}

/** The picture: the supplied image when there is one, the drawn motif when not. */
function Visual({ goal }: { goal: Entry }) {
  return (
    <figure className="gs-figure" style={{ ['--tone' as string]: goal.tone }}>
      {goal.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={goal.image} alt="" loading="lazy" decoding="async" />
      ) : (
        <span className="gs-motif" aria-hidden="true">
          <GoalMotif icon={goal.icon} />
          <span className="gs-motif-icon"><Icon name={goal.icon ?? 'star'} /></span>
        </span>
      )}
      <figcaption className="gs-stat">
        <strong>{goal.metric}</strong>
        <span>{goal.metricLabel}</span>
      </figcaption>
    </figure>
  );
}

function Head({ goal }: { goal: Entry }) {
  return (
    <>
      <p className="gs-eyebrow">
        <span className="gs-dot" aria-hidden="true" /> {goal.eyebrow ?? 'Goal'}
      </p>
      <h3>{goal.title}</h3>
      {goal.summary && <p className="gs-sub">{goal.summary}</p>}
      {goal.points && goal.points.length > 0 && (
        <ul className="gs-points">
          {goal.points.slice(0, 3).map((pt) => (
            <li key={pt}><Icon name="check" /> {pt}</li>
          ))}
        </ul>
      )}
      <Link href={`/goals/${goal.slug}`} className="btn btn-primary btn-sm gs-cta">
        Explore this goal <Icon name="arrow" className="h-4 w-4" />
      </Link>
    </>
  );
}
