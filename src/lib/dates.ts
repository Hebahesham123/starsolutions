import type { Locale } from '@/lib/i18n';

const TZ = 'Africa/Cairo';

/** Cairo's UTC offset on a given day, e.g. "+03:00" in summer, "+02:00" in winter. */
function cairoOffset(date: string): string {
  // 06:00 UTC is 08:00-09:00 in Cairo, well clear of the midnight DST switch.
  const name = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'longOffset' })
    .formatToParts(new Date(`${date}T06:00:00Z`))
    .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+02:00';
  const m = name.match(/GMT([+-]\d{2}):?(\d{2})?/);
  return m ? `${m[1]}:${m[2] ?? '00'}` : '+02:00';
}

/**
 * A "YYYY-MM-DD" date as full ISO 8601 at 09:00 Cairo time, with the offset
 * Cairo actually had that day (Egypt observes daylight saving), e.g.
 * "2026-07-28T09:00:00+03:00". What Google's Rich Results Test expects.
 */
export function cairoIso(date: string): string {
  return `${date}T09:00:00${cairoOffset(date)}`;
}

/** "Nov 8, 2026" / "8 نوفمبر 2026" (Western digits, as the rest of the site). */
export function formatDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', {
    timeZone: TZ, day: 'numeric', month: locale === 'ar' ? 'long' : 'short', year: 'numeric',
  }).format(new Date(cairoIso(date)));
}

/* ---------- Instants (timestamptz) ---------- */

/** The parts of an instant on Cairo's wall clock. */
function cairoParts(iso: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZoneName: 'longOffset',
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const m = get('timeZoneName').match(/GMT([+-]\d{2}):?(\d{2})?/);
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}:${get('second')}`,
    offset: m ? `${m[1]}:${m[2] ?? '00'}` : '+02:00',
  };
}

/** A stored timestamp as ISO 8601 on Cairo's clock, e.g. "2026-11-07T09:00:00+02:00". */
export function cairoInstantIso(iso: string): string {
  const p = cairoParts(iso);
  return `${p.date}T${p.time}${p.offset}`;
}

/** The Cairo calendar day of a timestamp, "YYYY-MM-DD". */
export function cairoDateOf(iso: string): string {
  return cairoParts(iso).date;
}

/** Today in Cairo, "YYYY-MM-DD". */
export function cairoToday(): string {
  return cairoDateOf(new Date().toISOString());
}

/** A Cairo wall-clock "YYYY-MM-DDTHH:mm" (a datetime-local input) as ISO 8601 with Cairo's offset. */
export function cairoLocalToIso(local: string): string {
  const [date, time = '00:00'] = local.split('T');
  return `${date}T${time.slice(0, 5)}:00${cairoOffset(date)}`;
}

/** The reverse, for filling a datetime-local input: "YYYY-MM-DDTHH:mm" in Cairo. */
export function cairoLocalOf(iso: string): string {
  const p = cairoParts(iso);
  return `${p.date}T${p.time.slice(0, 5)}`;
}
