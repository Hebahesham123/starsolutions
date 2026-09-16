/**
 * The line drawing that sits on the right of each figure tile.
 *
 * Not the same job as the icon chip in the corner, which is a marker: these are
 * bigger, quieter and say what the number is about — scales for how many
 * businesses, a clock running fast for hours saved, a cart for order value. All
 * stroke, no fill, drawn in currentColor at low opacity, so a tile changes them
 * by changing its own text colour and nothing here needs a palette of its own.
 *
 * Keyed by the figure's `metric`, which is the same key the chart switches on,
 * so a figure without a drawing here simply renders without one.
 */
/**
 * Two stops per drawing. The reference gives each figure its own run of colour
 * rather than one tint across all six — violet through the body, and gold on
 * anything that points up, so "more" and "less" read differently at a glance.
 */
const STOPS: Record<string, [string, string]> = {
  businesses: ['#C4B5FD', '#8B7BFF'],
  hours:      ['#A78BFA', '#F472B6'],
  roas:       ['#7FB0FF', '#FBBF24'],
  aov:        ['#A78BFA', '#FBBF24'],
  support:    ['#60A5FA', '#A78BFA'],
  adspend:    ['#B9A8FF', '#7FB0FF'],
};

const ART: Record<string, React.ReactNode> = {
  /* Scales — what "businesses scaled" is a count of. */
  businesses: (
    <>
      <path d="M32 13v26M23 40h18" />
      <path d="M14 17h36" />
      <circle cx="32" cy="12" r="2.6" />
      <path d="M14 17v5M50 17v5" />
      <path d="M7 22q7 9 14 0M43 22q7 9 14 0" />
    </>
  ),

  /* A clock with the hours running off it. */
  hours: (
    <>
      <circle cx="41" cy="24" r="13" />
      <path d="M41 24v-7M41 24l5.5 3" />
      <path d="M9 16h13M4 24h14M11 32h11" />
    </>
  ),

  /* Return climbing away from the spend it started at. */
  roas: (
    <>
      <path d="M9 39h47" />
      <path d="M12 36c11 0 16-8 22-16 4-5.5 9-8 18-9" />
      <path d="M45 9h8v8" />
    </>
  ),

  /* A basket worth more than it was. */
  aov: (
    <>
      <path d="M6 13h6l5 18h22" />
      <path d="M17 26h23l4-11H14" />
      <circle cx="21" cy="37" r="2.4" />
      <circle cx="37" cy="37" r="2.4" />
      <path d="M40 22 52 10M44 10h8v8" />
    </>
  ),

  /* The arm that answers while nobody is there. Two segments off a base, with
     a claw big enough to read at 40px — the previous one was a stick. */
  support: (
    <>
      <path d="M8 42h19M17.5 42v-5" />
      <path d="M17.5 37 31 21M31 21l13 2.5" />
      <circle cx="17.5" cy="37" r="3.1" />
      <circle cx="31" cy="21" r="3.1" />
      <path d="M44 23.5 53 18M44 23.5 51 30" />
    </>
  ),

  /* Spend coming down, which is the direction that is good here. */
  adspend: (
    <>
      <path d="M9 9v31h47" />
      <path d="m13 15 11 9 10-5 12 15" />
      <circle cx="13" cy="15" r="1.9" />
      <circle cx="24" cy="24" r="1.9" />
      <circle cx="34" cy="19" r="1.9" />
      <path d="M39 34h8v-8" />
    </>
  ),
};

export function StatArt({ name }: { name: string }) {
  const art = ART[name];
  if (!art) return null;
  const stops = STOPS[name];
  /* One figure per metric on a page, so the metric is already a unique id. */
  const gid = `statArt-${name}`;
  return (
    <svg
      className="rt-art"
      viewBox="0 0 64 48"
      fill="none"
      stroke={stops ? `url(#${gid})` : 'currentColor'}
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {stops && (
        <defs>
          {/* userSpaceOnUse, not the default objectBoundingBox: a bbox that is
              gradient-mapped per element is degenerate for a pure horizontal
              or vertical path — zero height — and the spec says such an
              element is not rendered. It silently ate the scales' beam and the
              ROAS baseline. Spanning the viewBox also runs one gradient across
              the whole drawing rather than restarting it in every path. */}
          <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1="48" x2="64" y2="0">
            <stop offset="0%" stopColor={stops[0]} />
            <stop offset="100%" stopColor={stops[1]} />
          </linearGradient>
        </defs>
      )}
      {art}
    </svg>
  );
}
