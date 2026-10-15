'use client';

import * as React from 'react';

/**
 * Hold the decorative animations still while the page is moving.
 *
 * Forty-odd infinite CSS animations run on the home page — stars, the orbit,
 * the beads travelling along the web, the dial. Each one ticks on every frame
 * whether or not it is on screen, and on a mid-range phone that doubles the
 * number of frames that miss their deadline during a scroll: 61 against 24
 * measured at 4x throttling.
 *
 * Nobody is watching a star blink while the page is in motion — they are
 * watching the content go past. So the class goes on for the length of the
 * gesture and comes off a beat after it stops, which is when the animations
 * are worth paying for. The cost is two style recalculations, one at each
 * end, instead of one per frame for the whole scroll.
 *
 * `animation-play-state` rather than `animation:none` on purpose: paused
 * keyframes resume from where they were, so nothing jumps back to its start
 * when the reader stops.
 */
export function ScrollQuiet() {
  React.useEffect(() => {
    /* Someone who has asked for less motion already has these switched off by
       the reduced-motion rules; adding and removing a class at them is work
       with nothing at the other end of it. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let moving = false;

    const stop = () => { moving = false; root.classList.remove('is-scrolling'); };
    const onScroll = () => {
      if (!moving) { moving = true; root.classList.add('is-scrolling'); }
      clearTimeout(timer);
      timer = setTimeout(stop, 140);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
      stop();
    };
  }, []);

  return null;
}
