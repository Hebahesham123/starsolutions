import Script from 'next/script';

const TAG_ID = 'GTM-MTQJRX3Q';
const HOST = 'www.starsolution.ai';

/**
 * Google tag (Tag Manager container GTM-MTQJRX3Q) for the public site.
 *
 * Mounted once in each public root layout, (site) and (ar), so /admin is
 * never tracked, the same as the Meta Pixel. `afterInteractive` runs it after
 * hydration, so it never blocks the first paint; the container itself loads
 * async from there.
 *
 * Production only, twice over:
 *  - at build time it renders nothing unless VERCEL_ENV is 'production', so
 *    local dev and Vercel preview builds never include it;
 *  - in the browser it only loads on www.starsolution.ai, so the second Vercel
 *    project's production build (a *.vercel.app address) stays untracked too.
 *
 * Google's snippet defines `gtag` and sends the `js` timestamp. The
 * `gtm.start` / `gtm.js` push is the standard Tag Manager page-load event: a
 * GTM- container's "All Pages" / "Page View" triggers fire on it, so without it
 * the container would load but its page-view tags would not run. The
 * `__gtagLoaded` flag keeps it to one load even if the script ran again.
 */
export function GoogleTag() {
  if (process.env.VERCEL_ENV !== 'production') return null;
  return (
    <Script id="google-tag" strategy="afterInteractive">
      {`(function(w,d){if(w.location.hostname!=='${HOST}'||w.__gtagLoaded)return;w.__gtagLoaded=true;
w.dataLayer=w.dataLayer||[];w.gtag=function(){w.dataLayer.push(arguments);};
w.gtag('js',new Date());
w.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var s=d.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id=${TAG_ID}';
d.head.appendChild(s);})(window,document);`}
    </Script>
  );
}
