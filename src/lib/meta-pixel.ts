/**
 * Browser-side helpers for the Meta Pixel.
 *
 * Every conversion is sent twice — once from the browser (fbq) and once from the
 * server (Conversions API, see meta-capi.ts). Both carry the same event ID, and
 * that shared ID is what lets Meta count them as one event instead of two.
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: (...args: any[]) => void;
  }
}

/** A unique ID for one conversion. crypto.randomUUID needs a secure context,
 *  so fall back to something random enough when it is missing. */
export function newEventId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Fire a Lead from the browser. Safe to call when the pixel is not loaded. */
export function trackLead(eventId: string, contentName: string) {
  try {
    window.fbq?.('track', 'Lead', { content_name: contentName }, { eventID: eventId });
  } catch {
    /* tracking must never break the form */
  }
}
