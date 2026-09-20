import Link from 'next/link';
import { getDict, localeHref, type Locale } from '@/lib/i18n';

/**
 * The 404 body, shared by both locales' boundaries.
 *
 * A miss is routed into a locale group by the catch-all page there, so by the
 * time this renders the chrome is already in place and the only thing it needs
 * to know is which language to answer in.
 */
export function NotFoundBody({ locale = 'en' }: { locale?: Locale }) {
  const t = getDict(locale);
  return (
    <section className="section">
      <div className="empty-state">
        <p className="eyebrow justify-center"><span className="eyebrow-dot" aria-hidden="true" /> 404</p>
        <h1>{t('nf.title')}</h1>
        <p>{t('nf.body')}</p>
        <Link href={localeHref(locale, '/')} className="btn btn-primary btn-lg mt-6">{t('nf.back')}</Link>
      </div>
    </section>
  );
}
