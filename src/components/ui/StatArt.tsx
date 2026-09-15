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

  /* The arm that answers while nobody is there. */
  support: (
    <>
      <path d="M10 41h18M19 41v-7" />
      <path d="m19 34 12-12M31 22l14-4" />
      <circle cx="19" cy="34" r="2.6" />
      <circle cx="31" cy="22" r="2.6" />
      <path d="m45 18 6-4M45 18l5 5" />
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
  return (
    <svg
      className="rt-art"
      viewBox="0 0 64 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {art}
    </svg>
  );
}
