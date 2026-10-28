'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import * as React from 'react';

/**
 * Set after the first page has mounted. The first page is the server-rendered
 * one: if Framer owned its fade, its `initial` would be written into the HTML
 * as `opacity: 0` and the whole page would stay invisible until the JavaScript
 * loaded. So the first page fades in CSS (.route-first) from the first paint,
 * and Framer takes over for client-side navigations, exactly as before.
 */
let navigated = false;

/** Cross-fades between routes. Skipped entirely under reduced motion. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const first = React.useRef(!navigated);
  React.useEffect(() => { navigated = true; }, []);
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      key={pathname}
      className={first.current ? 'route-first' : undefined}
      initial={first.current ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 0.84, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
