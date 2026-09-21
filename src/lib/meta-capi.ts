import { createHash } from 'crypto';

/**
 * Meta Conversions API — the server-side half of the pixel.
 *
 * Needs NEXT_PUBLIC_META_PIXEL_ID and META_CAPI_ACCESS_TOKEN. Without either it
 * does nothing. META_TEST_EVENT_CODE, when set, routes events to the "Test
 * events" tab in Events Manager; remove it once the setup is confirmed.
 *
 * Personal data (email, phone, name) is SHA-256 hashed before it leaves the
 * server, as Meta requires. IP, user agent and the _fbp/_fbc cookies are sent
 * as-is — Meta expects those unhashed.
 */

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v23.0';

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

/** Digits only, with Egypt's country code in front of local numbers
 *  (010… → 2010…). Numbers already written with +20 / 0020 keep it. */
function normalizePhone(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  else if (d.startsWith('0')) d = '20' + d.slice(1);
  return d;
}

export type MetaEventInput = {
  eventName: string;
  eventId: string;
  sourceUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  customData?: Record<string, unknown>;
};

export async function sendMetaEvent(e: MetaEventInput): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return;

  const user_data: Record<string, unknown> = {};
  if (e.ip) user_data.client_ip_address = e.ip;
  if (e.userAgent) user_data.client_user_agent = e.userAgent;
  if (e.fbp) user_data.fbp = e.fbp;
  if (e.fbc) user_data.fbc = e.fbc;
  if (e.email) user_data.em = [sha256(e.email.trim().toLowerCase())];
  if (e.phone) {
    const ph = normalizePhone(e.phone);
    if (ph) user_data.ph = [sha256(ph)];
  }
  if (e.name) {
    const parts = e.name.trim().toLowerCase().split(/\s+/);
    if (parts[0]) user_data.fn = [sha256(parts[0])];
    if (parts.length > 1) user_data.ln = [sha256(parts[parts.length - 1])];
  }

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: e.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: e.eventId,
        action_source: 'website',
        ...(e.sourceUrl ? { event_source_url: e.sourceUrl } : {}),
        user_data,
        ...(e.customData ? { custom_data: e.customData } : {}),
      },
    ],
  };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        // Never let Meta being slow hold up the visitor's form submission.
        signal: AbortSignal.timeout(4000),
        cache: 'no-store',
      },
    );
    if (!res.ok) console.error('[meta-capi] rejected:', res.status, await res.text());
  } catch (err) {
    console.error('[meta-capi] failed:', err instanceof Error ? err.message : err);
  }
}

/** Read the request details Meta uses for matching. */
export function requestContext(request: Request) {
  const cookie = request.headers.get('cookie') ?? '';
  const read = (name: string) => {
    const m = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
    return m ? decodeURIComponent(m[1]) : null;
  };
  const referer = request.headers.get('referer');

  // _fbc is set by the pixel when someone arrives from an ad (?fbclid=…). If the
  // cookie is missing but the page URL still has the click ID, build it.
  let fbc = read('_fbc');
  if (!fbc && referer) {
    try {
      const fbclid = new URL(referer).searchParams.get('fbclid');
      if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
    } catch {
      /* bad referer, ignore */
    }
  }

  return {
    ip: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip'),
    userAgent: request.headers.get('user-agent'),
    sourceUrl: referer,
    fbp: read('_fbp'),
    fbc,
  };
}
