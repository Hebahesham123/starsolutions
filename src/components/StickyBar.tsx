'use client';

import Link from 'next/link';
import * as React from 'react';
import { Icon } from './Icon';
import { getDict, localeHref, type Locale } from '@/lib/i18n';

/** `whatsapp` is passed in rather than imported: this is a client component,
 *  and importing site.json here would ship all 44KB of site content to the
 *  browser for one URL. */
export function StickyBar({ locale = 'en', whatsapp }: { locale?: Locale; whatsapp: string }) {
  const t = getDict(locale);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 620);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`sticky-bar${visible ? ' is-visible' : ''}`} aria-label={t('a11y.quickActions')}>
      <Link href={localeHref(locale, '/contact')} className="btn btn-primary btn-lg flex-1">{t('cta.audit')}</Link>
      <a href={whatsapp} className="wa-btn" aria-label={t('cta.whatsapp')}>
        <Icon name="whatsapp" />
      </a>
    </div>
  );
}
