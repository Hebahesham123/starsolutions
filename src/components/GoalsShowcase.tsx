import { existsSync } from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { Icon } from './Icon';
import { Rail } from './Rail';
import { GoalMotif } from './ui/GoalMotif';
import type { Entry } from '@/lib/types';
import { getDict, localeHref, type Locale } from '@/lib/i18n';

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
const EXTS = ['jpg', 'jpeg', 'webp', 'png'];

/**
 * The picture for a goal, or nothing.
 *
 * Resolved from the slug rather than from a field on the row, because the
 * goals come from Supabase and that table has no image column — a path in
 * site.json is only ever read when the database is unreachable, so wiring it
 * that way meant the pictures never appeared. Convention needs no column and
 * no admin field: drop public/goals/<slug>.jpg in and it shows.
 *
 * `image` still wins when set, for anything that does not follow the naming.
 * Several extensions are tried so a .webp or .png works without an edit.
 *
 * This is a server component, so the filesystem look happens when the page is
 * rendered, not per request in the browser.
 */
function goalImage(goal: Entry): string | null {
  const here = (src: string) =>
    existsSync(path.join(process.cwd(), 'public', src.replace(/^\//, ''))) ? src : null;

  if (goal.image) return here(goal.image);
  for (const ext of EXTS) {
    const found = here(`/goals/${goal.slug}.${ext}`);
    if (found) return found;
  }
  return null;
}

export function GoalsShowcase({ goals, locale = 'en' }: { goals: Entry[]; locale?: Locale }) {
  const t = getDict(locale);
  return (
    <div className="goal-stage mx-auto max-w-shell px-5 lg:px-8">
      <Rail id="goals" label={t('rail.goals')} className="goal-rail">
      {goals.map((g) => (
        <Link
          key={g.id}
          href={localeHref(locale, `/goals/${g.slug}`)}
          className="goal-banner"
          style={{ ['--tone' as string]: g.tone }}
        >
          <span className={`gb-shot${goalImage(g) ? ' is-photo' : ''}`}>
            {goalImage(g) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={goalImage(g)!} alt="" loading="lazy" decoding="async" />
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
    </div>
  );
}
