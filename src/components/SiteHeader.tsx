'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';
import { Icon } from './Icon';
import { LogoStatic } from './ui/LogoStatic';
import { SiteSearch, type SearchDoc } from './ui/SiteSearch';
import { AgentCallback } from './ui/AgentCallback';
import { getDict, localeHref, stripLocale, LOCALE_META, type Locale } from '@/lib/i18n';

/** Paths only. The labels are looked up per locale, so a nav item cannot go
 *  out of sync with the page it points at. */
const NAV = [
  { href: '/solutions', key: 'nav.solutions' },
  { href: '/results', key: 'nav.results' },
  { href: '/process', key: 'nav.process' },
  { href: '/work', key: 'nav.work' },
  { href: '/case-studies', key: 'nav.caseStudies' },
  { href: '/blog', key: 'nav.blog' },
  { href: '/about', key: 'nav.about' },
];

/** `whatsapp` is passed in rather than imported — see StickyBar. */
export function SiteHeader({
  locale = 'en',
  whatsapp,
  searchDocs = [],
}: {
  locale?: Locale;
  whatsapp: string;
  searchDocs?: SearchDoc[];
}) {
  const t = getDict(locale);
  const rtl = LOCALE_META[locale].dir === 'rtl';
  const href = (path: string) => localeHref(locale, path);
  /** The same page in the other language. */
  const other: Locale = locale === 'ar' ? 'en' : 'ar';
  const [open, setOpen] = React.useState(false);
  const [stuck, setStuck] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => { setOpen(false); }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <div className="promo-bar" role="region" aria-label="Current offer">
        <Link href={href('/contact')} className="promo-shell">
          <span className="promo-dot" aria-hidden="true" />
          <p>
            <strong>{t('promo.audit')}</strong>
            <span className="promo-sep" aria-hidden="true"> · </span>
            <span className="promo-tail">{t('promo.tail')}</span>
          </p>
          <Icon name="arrow" className="promo-arrow" />
        </Link>
      </div>

      <header id="siteHeader" className={`site-header${stuck ? ' is-stuck' : ''}`}>
        <div className="header-shell">
          {/* aria-label rather than bare content: the link needs to say where
              it goes, and "Star Solution" alone does not. It opens with the
              visible wordmark so it still satisfies Label in Name. The tagline
              is off — at 34px it would be 5px of letterspaced caps. */}
          <Link href={href('/')} className="brand" aria-label={t('a11y.home')}>
            <LogoStatic size={34} showTagline={false} />
          </Link>

          <nav className="desktop-nav" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={href(item.href)}
                className={stripLocale(pathname).startsWith(item.href) ? 'is-active' : undefined}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <SiteSearch docs={searchDocs} />
            <AgentCallback />
            <Link
              href={localeHref(other, stripLocale(pathname))}
              className="lang-switch"
              lang={LOCALE_META[other].htmlLang}
              hrefLang={LOCALE_META[other].htmlLang}
              aria-label={t('lang.switchLabel')}
            >
              {t('lang.switch')}
            </Link>
            <Link href={href('/contact')} className="btn btn-primary btn-sm header-cta">
              {t('cta.audit')} <Icon name="arrow" className="cta-arrow" />
            </Link>
            <button
              type="button"
              id="navToggle"
              className="nav-toggle lg:hidden"
              aria-expanded={open}
              aria-controls="mobileNav"
              onClick={() => setOpen(true)}
            >
              <Icon name="menu" className="h-6 w-6" />
              <span className="sr-only">{t('cta.openMenu')}</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobileNav"
            className="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              className="mobile-nav-panel"
              initial={{ x: rtl ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: rtl ? '-100%' : '100%' }}
              transition={{ duration: 0.32, ease: [0.22, 0.75, 0.24, 1] }}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <LogoStatic size={28} showTagline={false} />
                <button type="button" className="nav-toggle" aria-label={t('cta.closeMenu')} onClick={() => setOpen(false)}>
                  <Icon name="close" className="h-6 w-6" />
                </button>
              </div>

              <nav className="mobile-links" aria-label="Mobile">
                {NAV.map((item) => (
                  <Link key={item.href} href={href(item.href)}>
                    {t(item.key)} <Icon name="arrow" />
                  </Link>
                ))}
                <Link href={href('/team')}>{t('nav.team')} <Icon name="arrow" /></Link>
                <Link href={href('/contact')}>{t('nav.contact')} <Icon name="arrow" /></Link>
              </nav>

              <div className="mt-auto grid gap-3 px-5 pb-8">
                <Link href={href('/contact')} className="btn btn-primary btn-lg w-full">{t('cta.audit')}</Link>
                <a href={whatsapp} className="btn btn-ghost btn-lg w-full">
                  <Icon name="whatsapp" className="h-5 w-5 text-[#25D366]" /> {t('cta.whatsapp')}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
