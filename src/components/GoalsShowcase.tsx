import { existsSync } from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { Icon } from './Icon';
import { Rail } from './Rail';
import { GoalMotif } from './ui/GoalMotif';
import type { Entry } from '@/lib/types';

/**
 * The goals, as a horizontal rail of banner cards.
 *
 * Each card is a picture with the short copy under it — title, the headline
 * number, and the link through. The text is deliberately the same as the grid
 * it replaced: the banner is the change, not more words.
 *
 * Uses the same Rail as the case studies and testimonials, so it snaps, takes
 * arrow keys, shows arrows only when there is something to page to, and is
 * announced as a scrollable region. Nothing here is pinned or scroll-jacked.
 *
 * `image` is optional, and only used when the file is actually on disk. A path
 * in the data for a picture nobody has supplied yet would render a broken
 * image, which is worse than the drawn motif it replaced, so the file is
 * checked here — a server component, so this is a build-time look at the
 * filesystem, not a request-time one. Drop a file into public/goals and it
 * appears; nothing else to edit.
 */
const onDisk = (src?: string) =>
  Boolean(src && existsSync(path.join(process.cwd(), 'public', src.replace(/^\//, ''))));

export function GoalsShowcase({ goals }: { goals: Entry[] }) {
  return (
    <Rail id="goals" label="Business goals" className="goal-rail">
      {goals.map((g) => (
        <Link
          key={g.id}
          href={`/goals/${g.slug}`}
          className="goal-banner"
          style={{ ['--tone' as string]: g.tone }}
        >
          <span className={`gb-shot${onDisk(g.image) ? ' is-photo' : ''}`}>
            {onDisk(g.image) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={g.image} alt="" loading="lazy" decoding="async" />
            ) : (
              <span className="gb-motif" aria-hidden="true">
                <GoalMotif icon={g.icon} />
              </span>
            )}
            <span className="gb-veil" aria-hidden="true" />
            <span className="gb-badge">
              <Icon name={g.icon ?? 'star'} />
            </span>
            <span className="gb-metric">
              <strong>{g.metric}</strong>
              <span>{g.metricLabel}</span>
            </span>
          </span>

          <span className="gb-foot">
            <span className="gb-title">{g.title}</span>
            <span className="gb-go" aria-hidden="true"><Icon name="arrow" /></span>
          </span>
        </Link>
      ))}
    </Rail>
  );
}
