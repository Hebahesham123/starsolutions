import { Plus_Jakarta_Sans } from 'next/font/google';
import '@/app/globals.css';
import '@/app/design-system.css';
import '@/app/next-additions.css';
import { LOCALE_META, type Locale } from '@/lib/i18n';

/** The logo face. Exposed as a CSS variable so Tailwind's `font-jakarta`
 *  can reach it from any component. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

/**
 * The document — `<html>`, `<head>`, `<body>` — for whichever locale owns it.
 *
 * There is no `src/app/layout.tsx`. `lang` and `dir` have to be on `<html>`,
 * and a single root layout can only vary them by reading the request, which
 * makes every page dynamic. So each locale group owns a root layout instead:
 * `(site)` is English, `(ar)` is Arabic, and `/admin` has its own because it
 * shares none of the marketing chrome. That is three copies of the same
 * document, which is what this exists to prevent.
 *
 * The stylesheets come with it. They used to be imported by the shared root,
 * and /admin inherited them from there — it still needs globals.css for
 * Tailwind's base layer, so all three go everywhere, exactly as before. The
 * one exception is rtl.css, which the Arabic layout adds for itself: every
 * rule in it is scoped to [dir='rtl'], so loading it on English pages would
 * change nothing except the size of the stylesheet they download.
 */
export function LocaleDocument({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const meta = LOCALE_META[locale];
  return (
    // suppressHydrationWarning covers this one element, one level deep: the
    // pre-paint script below sets --splash on <html>, so the DOM React hydrates
    // carries an attribute the server never rendered. This is the documented
    // escape hatch for that, and the same one theme scripts use.
    <html
      lang={meta.htmlLang}
      dir={meta.dir}
      className={`js ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint: sets --splash on <html> when the splash has
            already been shown this session, so the CSS can hide it with no flash.
            A custom property rather than a class on purpose — className on <html>
            is rendered by the layout and hydrated against, so adding to it here
            made the client and server disagree and React logged a mismatch on
            every load after the first.
            Kept to one try/catch — sessionStorage throws, not returns null, in
            some privacy modes, and an exception here would block the parser. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(sessionStorage.getItem('ss-splash-seen'))document.documentElement.style.setProperty('--splash','none')}catch(e){}",
          }}
        />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@500,600,700&f[]=satoshi@400,500,700&f[]=jetbrains-mono@500&display=swap"
          rel="stylesheet"
        />
        {/* Satoshi and General Sans have no Arabic glyphs. rtl.css names this
            family literally, so it is loaded by name rather than through
            next/font, which would give it a generated one. */}
        {locale === 'ar' && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link
              href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
              rel="stylesheet"
            />
          </>
        )}
      </head>
      <body className="bg-white font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
