'use client';

import * as React from 'react';
import { LogoStatic } from './LogoStatic';

/** Session key. Shared with the inline pre-paint script in the root layout. */
const SEEN = 'ss-splash-seen';

/**
 * The first-load splash.
 *
 * A full-screen overlay is the most dangerous thing you can put on a site: if
 * it ever fails to leave, the site is gone. So dismissal does not depend on
 * this component, on React, or on JavaScript running at all.
 *
 *   1. The fade-out is a CSS animation ending in `visibility: hidden`, with
 *      `forwards`. If the bundle 404s, if hydration throws, if the user is on a
 *      browser with JS off — the overlay still removes itself on time. That is
 *      the only guarantee that matters here and it is the one that costs
 *      nothing.
 *   2. This component then unmounts it, so the node is not left in the DOM.
 *   3. A click, a key, or a scroll cuts it short.
 *
 * It is server-rendered rather than mounted on the client, so it paints with
 * the first frame; mounting it after hydration would show the page, then cover
 * it, which is worse than no splash. The page content is in the DOM behind it
 * the whole time, so crawlers and screen readers are unaffected — the overlay
 * is aria-hidden and never takes focus.
 *
 * Shown once per tab, not per navigation: repeat views inside a session are
 * suppressed before first paint by the script in the root layout, which adds
 * `splash-done` to <html>. Reduced motion skips it in CSS, for the same
 * before-paint reason.
 */
export function SiteSplash() {
  const [gone, setGone] = React.useState(false);

  React.useEffect(() => {
    // Written immediately, not on completion: someone who leaves mid-splash has
    // still seen it, and should not be shown it again on the way back.
    try { sessionStorage.setItem(SEEN, '1'); } catch { /* private mode */ }

    // Matches the CSS animation. Slightly longer, so the node is removed after
    // the paint that hides it rather than during it.
    const done = window.setTimeout(() => setGone(true), 1000);

    const skip = () => setGone(true);
    window.addEventListener('pointerdown', skip, { once: true });
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('wheel', skip, { once: true, passive: true });
    window.addEventListener('touchmove', skip, { once: true, passive: true });

    return () => {
      window.clearTimeout(done);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchmove', skip);
    };
  }, []);

  if (gone) return null;

  return (
    <div className="site-splash" aria-hidden="true">
      {/* The still logo, not LogoAnimated. Every part of the animated one is a
          Framer animation whose starting opacity:0 is written into the server
          HTML, so the splash showed an empty screen until hydration, and the
          wordmark became the page's LCP element once it finally appeared. The
          splash is gone in 0.8s, before the bundle has run on a phone, so the
          draw-in was rarely seen anyway. The entrance is CSS (.splash-logo),
          transform only: visible from the first paint. */}
      <LogoStatic size={72} layout="stacked" variant="dark" className="splash-logo" />
    </div>
  );
}

export default SiteSplash;
