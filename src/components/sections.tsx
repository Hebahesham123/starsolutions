import Link from 'next/link';
import { Icon } from './Icon';
import { Counter } from './Counter';
import { CaseVisual } from './ui/CaseVisual';
import { Reveal } from './Reveal';
import { Rail } from './Rail';
import { ProjectCard } from './ProjectCard';
import { GoalMotif } from './ui/GoalMotif';
import { SystemCard } from './ui/SystemCard';
import { LogoStatic } from './ui/LogoStatic';
import type { Entry, Project, Testimonial } from '@/lib/types';
import { GoalsShowcase } from './GoalsShowcase';

/* Every automation carries its own icon and tone, in site.json and — since the
   schema gained the columns — in Supabase too. These remain as a fallback for a
   row that arrives without them, but note it is a guess from array position, so
   it only lands correctly while the order matches the ring below. */
/** One per process step: analysis, craft, growth. */
const STEP_TONES = ['#3B82F6', '#7C6CFF', '#34D399'];

const AUTO_TONES = ['#3B82F6', '#34D399', '#FBBF24', '#F472B6', '#38BDF8', '#7C6CFF'];
const AUTO_ICONS = ['revenue', 'whatsapp', 'package', 'play', 'bot', 'build'];
export const autoTone = (i: number) => AUTO_TONES[i % AUTO_TONES.length];
export const autoIcon = (i: number) => AUTO_ICONS[i % AUTO_ICONS.length];

export function SectionHead({
  eyebrow, title, sub, id, row, action,
}: {
  eyebrow: string; title: string; sub?: string; id?: string; row?: boolean; action?: React.ReactNode;
}) {
  return (
    <Reveal as="header" className={`section-head${row ? ' section-head-row' : ''}`}>
      <div>
        <p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" /> {eyebrow}</p>
        <h2 id={id} className="section-title">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
      {action}
    </Reveal>
  );
}

/* ---------------- Goals ---------------- */
export function Goals({ goals }: { goals: Entry[] }) {
  return (
    <section className="section section-soft" aria-labelledby="goalsTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead id="goalsTitle" eyebrow="Choose your business goal" title="What do you want to achieve?" sub="Pick one. We build it." />
      </div>
      {/* Inside the shell, unlike the other rails. GoalsShowcase draws a frame
          around this one, and a frame has to end somewhere — full bleed would
          put its left and right edges off the screen. */}
      <GoalsShowcase goals={goals} />
    </section>
  );
}

/* ---------------- Systems ---------------- */
/**
 * The systems, led by the promise rather than the category.
 *
 * "Custom systems and dashboards" described the cards; it did not say why
 * anyone should care. The claim underneath them — that the client keeps the
 * software outright instead of renting it — is the thing that separates this
 * from every SaaS the reader already pays for, so it leads.
 *
 * Promoted out of the Work section, where it was a `group-label` and a row of
 * plain cards between the portfolio and the automations, and given the slot the
 * solutions bento used to hold. It is the thing the business actually builds,
 * so it gets a section head and cards with the same weight as the goals above.
 */
export function Systems({ systems }: { systems: Entry[] }) {
  if (!systems.length) return null;
  return (
    <section id="systems" className="section" aria-labelledby="sysTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead
          id="sysTitle"
          eyebrow="Our promise"
          title="You own everything we build"
          sub="Custom systems and dashboards, handed over in full — source, data and all. No monthly rent, no lock-in."
        />
        <ul className="system-list">
          {systems.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 0.06}>
              <SystemCard system={s} index={i} heading="h3" />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- Solutions ---------------- */
export function Solutions({ solutions }: { solutions: Entry[] }) {
  return (
    <section id="solutions" className="section" aria-labelledby="solTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead id="solTitle" eyebrow="What we do" title="The complete AI automation suite" sub="Six systems. Your existing tools." />
        <div className="bento">
          {solutions.map((s, i) => {
            const cls = i === 0 ? 'bento-lead' : i === 5 ? 'bento-wide' : '';
            const card = (
              <Link href={`/solutions/${s.slug}`} className="bento-card block h-full">
                <span className="sol-icon" style={{ ['--g1' as string]: s.tone }}><Icon name={s.icon ?? 'star'} /></span>
                <p className="sol-badge">{s.badge}</p>
                <h3>{s.title}</h3>
                <p className="sol-desc">{s.short}</p>
                <span className="card-glow" aria-hidden="true" />
              </Link>
            );
            // The first system is always on screen. The rest fade in as they
            // reach the bottom edge and fade back out when you scroll up.
            return i === 0
              ? <article key={s.id} className={cls}>{card}</article>
              : <Reveal as="article" key={s.id} className={cls} repeat>{card}</Reveal>;
          })}
        </div>
      </div>
    </section>
  );
}

/* One colour per event, in the order the reference uses them: the order is
   amber, the question violet, the recovered cart pink, the ad spend blue, the
   post green. Taken from the tones this site already uses rather than the
   reference's neon, which would have been a different brand wearing the same
   layout. */
const NIGHT_TONES = ['#F59E0B', '#7C6CFF', '#F472B6', '#3B82F6', '#34D399'];

/** The totals along the bottom, matched to the event they came from. */
function statIcon(label: string) {
  const t = label.toLowerCase();
  if (/message|repl|answer|chat/.test(t)) return 'whatsapp';
  if (/ad|spend|budget|roas/.test(t)) return 'chart';
  if (/post|publish|social/.test(t)) return 'play';
  return 'package';
}

/**
 * An icon for a line of the night log, read off what the line says.
 *
 * Matched on the words rather than kept in a column beside them: these entries
 * are edited as prose, and an icon field would be a second thing to remember
 * whenever one changes. Anything unrecognised falls through to the agent's own
 * mark, which is true of every line here — the agent did all of them.
 */
function nightIcon(title: string) {
  const t = title.toLowerCase();
  /* Conversation before commerce, deliberately. "Customer asked about an
     order" is a message, not an order, and testing for "order" first gave it a
     parcel — the more specific phrasing has to win or the general word
     swallows it. */
  if (/ask|question|message|repl|chat|support/.test(t)) return 'whatsapp';
  if (/cart|abandon|recover|refund/.test(t)) return 'revenue';
  if (/budget|spend|roas|campaign|\bads?\b/.test(t)) return 'chart';
  if (/post|publish|tiktok|social|caption/.test(t)) return 'play';
  if (/order|delivery|supplier|shipment/.test(t)) return 'package';
  return 'bot';
}

/* ---------------- Process ---------------- */
const PROCESS_SPARKS = [
  { left: '9%',  top: '62%', size: '26px' },
  { left: '92%', top: '26%', size: '30px' },
  { left: '61%', top: '10%', size: '18px' },
];

export function Process({ steps, log, stats, bare = false }: {
  steps: { num: string; icon: string; title: string; text: string }[];
  log: { time: string; title: string; text: string }[];
  stats: [string, string][];
  /**
   * Drop the section head. /process already states "Simple process — Three
   * steps to automated growth" in its PageHead, so rendering it again here put
   * the same eyebrow and the same H1-sized title twice, one directly under the
   * other.
   */
  bare?: boolean;
}) {
  return (
    <section id="how" className="section process-section" aria-labelledby={bare ? undefined : 'howTitle'}>
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        {!bare && (
          <SectionHead id="howTitle" eyebrow="Simple process" title="Three steps to automated growth" sub="Most clients are live in under 14 days." />
        )}

        {/* The scene. Rings, sparkles and the floor glow are decoration and
            carry aria-hidden; the steps themselves stay an ordered list, so
            the order survives with the styles switched off. */}
        <div className="po">
          <svg className="po-rings" viewBox="0 0 1200 420" preserveAspectRatio="none" aria-hidden="true">
            <ellipse className="po-ring-a" cx="600" cy="196" rx="560" ry="150" />
            <ellipse className="po-ring-b" cx="600" cy="214" rx="430" ry="188" />
            <g className="po-dots">
              <circle cx="176" cy="132" r="5" /><circle cx="1026" cy="118" r="5" />
              <circle cx="470" cy="330" r="4.5" /><circle cx="880" cy="66" r="4" />
              <circle cx="1140" cy="268" r="4.5" />
            </g>
          </svg>

          {PROCESS_SPARKS.map((sp, i) => (
            <span key={i} className="po-spark" style={{ left: sp.left, top: sp.top, ['--s' as string]: sp.size }} aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 0c.9 5.4 5.7 10.2 12 12-6.3 1.8-11.1 6.6-12 12-.9-5.4-5.7-10.2-12-12C6.3 10.2 11.1 5.4 12 0Z" /></svg>
            </span>
          ))}

          <ol className="po-steps">
            {steps.map((st, i) => (
              <Reveal
                as="li"
                key={st.num}
                className="po-step"
                delay={i * 0.1}
                style={{ ['--tone' as string]: STEP_TONES[i % STEP_TONES.length] }}
              >
                <span className="po-orb">
                  <span className="po-orb-ring" aria-hidden="true" />
                  <span className="po-orb-glass" aria-hidden="true" />
                  <Icon name={st.icon} />
                  <span className="po-badge">{st.num}</span>
                </span>
                <div className="po-card">
                  <span className="po-dash" aria-hidden="true" />
                  {bare ? <h2>{st.title}</h2> : <h3>{st.title}</h3>}
                  <p>{st.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <span className="po-floor" aria-hidden="true" />
        </div>

        <Reveal className="sleep-panel">
          <div className="sleep-head">
            <p className="eyebrow eyebrow-invert"><span className="eyebrow-dot" aria-hidden="true" /> While you sleep</p>
            {bare
              ? <h2>Your automations don&apos;t clock out</h2>
              : <h3>Your automations don&apos;t clock out</h3>}
            <p>One night, one account.</p>
          </div>
          {/* The night as a dial: the agent in the middle, the things it did
              around it, clockwise from the top so the ring reads as a clock and
              the order is not arbitrary.

              Same list on a phone, stacked — five labelled cards around a
              centre cannot be read at 390px, and pretending otherwise would
              cost the legibility the ring is there to add. */}
          <div className="dial">
            <span className="dial-orbit" aria-hidden="true" />
            <span className="dial-orbit dial-orbit-2" aria-hidden="true" />

            {/* The rays the reference draws converging on the agent. One per
                event, anchored at the centre and turned to its angle, so they
                point at the cards without needing to know where the cards
                ended up. */}
            <div className="dial-rays" aria-hidden="true">
              {log.map((l, i) => (
                <span
                  key={l.time}
                  className="dial-ray"
                  style={{
                    ['--deg' as string]: `${(i / log.length) * 360}deg`,
                    ['--tone' as string]: NIGHT_TONES[i % NIGHT_TONES.length],
                  }}
                />
              ))}
            </div>

            <div className="dial-core">
              <span className="dial-pulse" aria-hidden="true" />
              <span className="dial-orb" aria-hidden="true"><Icon name="bot" /></span>
              <span className="dial-core-label">AI agent</span>
              <span className="dial-core-sub">Think · Process · Act</span>
            </div>

            <ol className="dial-items">
              {log.map((l, i) => {
                /* Placed by angle rather than by hand: five events land 72
                   degrees apart whatever the list holds, and a sixth would
                   re-space the ring on its own. */
                const a = (i / log.length) * 2 * Math.PI;
                /* Direction only — how far along each axis is the stylesheet's
                   business. A phone needs a tighter ring than a desktop and the
                   radius belongs in the media query that knows that; handing
                   down a finished percentage would have pinned both to one
                   number. CSS multiplies these by --rx and --ry. */
                return (
                  <li
                    key={l.time}
                    className="dial-item"
                    style={{
                      ['--sx' as string]: Math.sin(a).toFixed(4),
                      ['--cy' as string]: (-Math.cos(a)).toFixed(4),
                      ['--tone' as string]: NIGHT_TONES[i % NIGHT_TONES.length],
                    }}
                  >
                    <span className="dial-icon"><Icon name={nightIcon(l.title)} /></span>
                    <span className="dial-text">
                      <span className="log-time">{l.time}</span>
                      <strong>{l.title}</strong>
                      <span>{l.text}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
          {/* The totals as a panel with a mark against each, the way the
              reference closes: four numbers in a row read as a footnote, four
              with their own icon read as a tally of the night above them. */}
          <dl className="sleep-stats">
            {stats.map(([k, v], i) => (
              <div key={k} style={{ ['--tone' as string]: NIGHT_TONES[i % NIGHT_TONES.length] }}>
                <span className="stat-mark" aria-hidden="true"><Icon name={statIcon(k)} /></span>
                <div>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Case studies ---------------- */
/**
 * A case KPI is one string covering several shapes — "85", "18K", "4.2",
 * "+280" — so the number has to be pulled out of it before it can be counted
 * up, along with whatever sits either side and how many decimals to hold.
 *
 * Returns null for anything without a number in it. These rows come from
 * Supabase, so a KPI reading "Sold out" is a thing someone can type, and it
 * should render as itself rather than as NaN.
 */
function parseKpi(raw?: string) {
  const m = /^([^\d]*)(\d+(?:\.\d+)?)(.*)$/.exec((raw ?? '').trim());
  if (!m) return null;
  const [, prefix, num, suffix] = m;
  const dot = num.indexOf('.');
  return { prefix, value: Number(num), decimals: dot < 0 ? 0 : num.length - dot - 1, suffix };
}

/** The KPI, counting up the first time the card is scrolled into view. */
function CaseKpi({ kpi }: { kpi?: string }) {
  const parsed = parseKpi(kpi);
  if (!parsed) return <>{kpi}</>;
  return (
    <Counter
      value={parsed.value}
      decimals={parsed.decimals}
      prefix={parsed.prefix}
      suffix={parsed.suffix}
    />
  );
}


export function CaseCard({ c }: { c: Entry }) {
  return (
    <article className="case-card">
      <Link href={`/case-studies/${c.slug}`} className="block h-full">
        <div className="case-visual" style={{ ['--c1' as string]: c.c1, ['--c2' as string]: c.c2 }}>
          {/* The unit needs its own class: .case-kpi span would otherwise also
              match the span Counter renders, and shrink the number to unit size. */}
          <p className="case-kpi"><CaseKpi kpi={c.kpi} /><span className="case-kpi-unit">{c.kpiUnit}</span></p>
          <p className="case-kpi-label">{c.kpiLabel}</p>
          {/* One drawing per metric, not one for all five — see CaseVisual. */}
          <CaseVisual parts={[c.kpiLabel, c.kpiUnit, c.before, c.after, c.type]} />
        </div>
        <div className="case-body">
          <p className="case-type">{c.type}</p>
          <div className="case-compare">
            <div><span>Before</span><strong>{c.before}</strong></div>
            {/* A rising zigzag, not a flat one: the row is a before/after, so
                the arrow between them should say the number went up rather
                than merely pointing at the next box. `revenue` is already that
                shape — a new glyph here would be a near-duplicate. */}
            <Icon name="revenue" className="case-arrow" />
            <div><span>After</span><strong>{c.after}</strong></div>
          </div>
          <p className="case-delta">{c.delta} <em>{c.period}</em></p>
          <span className="link-arrow">Read the case study <Icon name="arrow" /></span>
        </div>
      </Link>
    </article>
  );
}

export function CaseStudies({ cases }: { cases: Entry[] }) {
  return (
    <section className="section section-soft" aria-labelledby="caseTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead
          id="caseTitle" row eyebrow="Case studies" title="Real businesses. Real growth."
          action={<Link href="/case-studies" className="link-arrow">View all <Icon name="arrow" /></Link>}
        />
      </div>
      <Rail id="cases" label="Case studies">
        {cases.map((c) => <CaseCard key={c.id} c={c} />)}
      </Rail>
    </section>
  );
}

/* ---------------- Work ---------------- */
/* `systems` is gone from here: it has its own section further up the page now. */
export function Work({ projects }: { projects: Project[] }) {
  return (
    <section id="work" className="section" aria-labelledby="workTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        {/* The sub used to read "Websites, systems and automations" and name
            three things this section no longer holds: systems have had their
            own section for a while, and the automations now have one below.
            The "Live websites" label went with them — with only the rail left
            under it, it was a second heading for the same thing, and 52px of
            gap plus its own line to say it. */}
        <SectionHead id="workTitle" eyebrow="Portfolio" title="Our work and projects" sub="Real stores we designed, built and still run." />
      </div>
      {/* A rail rather than a stack. Each card is a tall thing — a before/after
          frame, a title, a paragraph and an expandable write-up — so stacked
          they pushed the automations below them most of a screen apart per
          project. Side by side, the set reads as a set. Rail is the same
          component the case studies use, so the arrows, dots, keyboard and
          snapping are the ones already on the page. */}
      <Rail id="live" label="Live websites" className="live-rail">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} delay={i * 0.08} heading="h4" />
        ))}
      </Rail>
    </section>
  );
}

/* ---------------- Automations ---------------- */
/**
 * Its own section, not a group label under the portfolio.
 *
 * It was the third block inside "Our work and projects", under a heading that
 * promised websites — so an automation read as a kind of website, and the label
 * announcing it sat flush against the rail above: .group-label:first-of-type
 * zeroes the top margin, and in its own wrapper it counted as first. A section
 * of its own is what it always was, and it gets the spacing every other one
 * has for free.
 */
/**
 * The web behind the automations: twelve threads out from the middle, and five
 * rings crossing them.
 *
 * The rings sag. Each span between two threads is a quadratic curve pulled in
 * toward the centre rather than a straight chord — a polygon reads as a radar
 * chart, and the sag is the whole difference between a net and a diagram.
 *
 * Drawn once at render from numbers rather than kept as a pasted path, so the
 * density is two constants to change rather than a file to redraw.
 */
function webPaths(spokes = 12, rings = 5, max = 96) {
  const at = (r: number, i: number) => {
    const a = (i / spokes) * 2 * Math.PI - Math.PI / 2;
    return [100 + r * Math.cos(a), 100 + r * Math.sin(a)] as const;
  };
  const spokeLines = Array.from({ length: spokes }, (_, i) => {
    const [x, y] = at(max, i);
    return `M100 100L${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  const ringPaths = Array.from({ length: rings }, (_, k) => {
    const r = max * ((k + 1) / rings) * 0.94;
    let d = '';
    for (let i = 0; i < spokes; i++) {
      const [x1, y1] = at(r, i);
      const [x2, y2] = at(r, i + 1);
      // Control point between the two, pulled in — this is the sag.
      const a = ((i + 0.5) / spokes) * 2 * Math.PI - Math.PI / 2;
      const cx = 100 + r * 0.87 * Math.cos(a);
      const cy = 100 + r * 0.87 * Math.sin(a);
      d += `${i === 0 ? `M${x1.toFixed(1)} ${y1.toFixed(1)}` : ''}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    }
    return d;
  });
  return { spokeLines, ringPaths };
}

/**
 * Everything works together.
 *
 * Three automations around one mark, joined by a web — the same shape as the
 * reference, in this site's light palette rather than its neon, and with the
 * Star Solution mark where the reference put a chip labelled "AI". The mark is
 * the better object anyway: the claim is that these three things are connected
 * by us, and a generic chip says that about anyone.
 */
export function Automations({ automations }: { automations: Entry[] }) {
  const { spokeLines, ringPaths } = webPaths();
  return (
    <section id="automations" className="section web-section" aria-labelledby="autoTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead
          id="autoTitle"
          eyebrow="AI automations & integrations"
          title="Everything works together"
          sub="Our AI connects your WhatsApp inbox, your chatbot and your automations — so you can talk, support and grow without touching any of it."
        />

        <div className="web">
          <svg className="web-net" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
            <g className="web-spokes">
              {spokeLines.map((d, i) => <path key={i} d={d} />)}
            </g>
            <g className="web-rings">
              {ringPaths.map((d, i) => <path key={i} d={d} />)}
            </g>
          </svg>

          {/* One lit thread per automation, from the mark out to its node. The
              net already has a spoke at each of those angles, but a spoke the
              same weight as the other eleven says nothing about which three
              are connected to anything. */}
          <div className="web-leads" aria-hidden="true">
            {automations.map((a, i) => (
              <span
                key={a.id}
                className="web-lead"
                style={{
                  ['--deg' as string]: `${(i / automations.length) * 360}deg`,
                  ['--tone' as string]: a.tone ?? autoTone(i),
                }}
              />
            ))}
          </div>

          <div className="web-core">
            <span className="web-core-glow" aria-hidden="true" />
            <LogoStatic layout="mark" size={96} className="web-core-mark" label="Star Solution" />
          </div>

          {/* Each node carries its own words, like the reference — no row of
              cards underneath.

              Which side they go on is the whole trick. An earlier pass centred
              the text under its node, so every label straddled the node's own
              spoke and the two lower ones ran back across the middle tile; the
              only way out was a radius that put them outside the box. Running
              each label outward instead — away from the centre, on the side its
              node already sits on — is what the reference does, and it means
              the text never crosses the web at all. `side` is read off the
              node's own angle, so it stays right however many automations
              there are. */}
          <ul className="web-ring">
            {automations.map((a, i) => {
              const angle = (i / automations.length) * 2 * Math.PI;
              const sx = Math.sin(angle);
              const side = Math.abs(sx) < 0.15 ? (Math.cos(angle) > 0 ? 'top' : 'bottom') : sx > 0 ? 'right' : 'left';
              return (
                <li
                  key={a.id}
                  className="web-pin"
                  data-side={side}
                  style={{
                    ['--sx' as string]: sx.toFixed(4),
                    ['--cy' as string]: (-Math.cos(angle)).toFixed(4),
                    ['--tone' as string]: a.tone ?? autoTone(i),
                  }}
                >
                  <Link href={`/automations/${a.slug}`} className="web-node-link">
                    <span className="web-dot" aria-hidden="true">
                      <Icon name={a.icon ?? autoIcon(i)} />
                    </span>
                    <span className="web-label">
                      <strong>{a.title}</strong>
                      <span>{a.short ?? a.summary}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="web-more">
          <Link href="/automations" className="link-arrow">See every automation <Icon name="arrow" /></Link>
        </p>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
export function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <section className="section section-soft" aria-labelledby="revTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead
          id="revTitle" row eyebrow="Client reviews" title="What our clients say"
          action={<p className="rating-line"><strong>4.9/5</strong> from 150+ clients</p>}
        />
      </div>
      <Rail id="reviews" label="Testimonials">
        {items.map((t) => (
          <figure className="review" key={t.id}>
            <Icon name="quote" className="rq" />
            <blockquote>{t.quote}</blockquote>
            <figcaption>
              <span className="avatar" style={{ ['--a1' as string]: t.tone }}>{t.initials}</span>
              <span><strong>{t.name}</strong>{t.role}</span>
            </figcaption>
          </figure>
        ))}
      </Rail>
    </section>
  );
}

/* ---------------- Team ---------------- */
export function Team({ team }: { team: Entry[] }) {
  return (
    <section className="section section-soft" aria-labelledby="teamTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead id="teamTitle" eyebrow="Our team" title="The people behind your growth" sub="Automation, AI and e-commerce." />
        <ul className="team-grid" id="teamRail">
          {team.map((m) => (
            <li className="team-card" key={m.id}>
              <Link href={`/team/${m.slug}`} className="flex flex-col items-center gap-1.5">
                <span className="avatar" style={{ ['--a1' as string]: m.tone }}>{m.initials}</span>
                <strong>{m.title}</strong>
                <span>{m.role}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
