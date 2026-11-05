import { Plus_Jakarta_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import '@/app/globals.css';
import '@/app/design-system.css';
import '@/app/next-additions.css';
import { LOCALE_META, type Locale } from '@/lib/i18n';
import { JsonLd } from '@/lib/schema';

/** The logo face. Exposed as a CSS variable so Tailwind's `font-jakarta`
 *  can reach it from any component. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

/*
 * The Fontshare faces, self-hosted from src/fonts (free to self-host under the
 * ITF Free Font License; JetBrains Mono is SIL OFL). They were a render-blocking
 * stylesheet from api.fontshare.com, and that URL only ever returned its first
 * family: Satoshi and JetBrains Mono never loaded and fell back to the system
 * font. Weights are the ones the pages actually render (measured, not guessed).
 * next/font names the families itself, so the CSS reaches them through these
 * variables rather than by 'General Sans' / 'Satoshi' / 'JetBrains Mono'.
 *
 * Only General Sans is preloaded: it sets the headings, which are the LCP
 * element on most pages. The other two swap in when the page asks for them.
 */
const generalSans = localFont({
  src: [
    { path: '../fonts/GeneralSans-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/GeneralSans-600.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/GeneralSans-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-general-sans',
  display: 'swap',
  preload: true,
});

/** No 600 exists for Satoshi; semibold text uses 700, as it would have from Fontshare. */
const satoshi = localFont({
  src: [
    { path: '../fonts/Satoshi-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Satoshi-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/Satoshi-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-satoshi',
  display: 'swap',
  preload: false,
});

const jetbrainsMono = localFont({
  src: [
    { path: '../fonts/JetBrainsMono-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/JetBrainsMono-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/JetBrainsMono-600.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/JetBrainsMono-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false,
  // A monospace face measured against Arial would give the wrong fallback.
  adjustFontFallback: false,
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
});

const fontVars = `${jakarta.variable} ${generalSans.variable} ${satoshi.variable} ${jetbrainsMono.variable}`;

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
  jsonLd,
  fontClass,
}: {
  locale: Locale;
  children: React.ReactNode;
  /** next/font variable classes for this locale's own faces (the Arabic one). */
  fontClass?: string;
  /** Site-wide structured data, rendered in <head>. Invisible on the page. */
  jsonLd?: object[];
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
      className={`js ${fontVars}${fontClass ? ` ${fontClass}` : ''}`}
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
        {/* The Arabic face (IBM Plex Sans Arabic) is no longer a Google Fonts
            stylesheet here: that blocked the first paint of every /ar page by
            ~1.8s on a phone. The Arabic layout loads it through next/font —
            self-hosted, preloaded, font-display: swap — and passes its
            variable in as fontClass; rtl.css reads var(--font-plex-ar). */}
        {jsonLd?.map((data, i) => <JsonLd key={i} data={data} />)}
      </head>
      <body className="bg-white font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
