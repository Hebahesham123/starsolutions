import Link from 'next/link';
import { Icon } from './Icon';
import { LogoStatic } from './ui/LogoStatic';
import { site } from '@/lib/content';
import { getContent, getDict, localeHref, type Locale } from '@/lib/i18n';

export function SiteFooter({ locale = 'en' }: { locale?: Locale }) {
  const t = getDict(locale);
  const href = (path: string) => localeHref(locale, path);
  const { contact } = locale === 'ar' ? getContent('ar') : site;
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href={href('/')} className="brand" aria-label={t('a11y.home')}>
              <LogoStatic size={34} showTagline={false} variant="dark" />
            </Link>
            <p>{t('footer.tagline')}</p>
            <Link href={href('/contact')} className="btn btn-primary btn-sm mt-5">{t('cta.audit')}</Link>
          </div>

          <nav aria-labelledby="fProduct">
            <h2 id="fProduct" className="footer-h">{t('footer.product')}</h2>
            <ul>
              <li><Link href={href('/solutions')}>{t('nav.solutions')}</Link></li>
              <li><Link href={href('/results')}>{t('nav.results')}</Link></li>
              <li><Link href={href('/work')}>{t('nav.work')}</Link></li>
              <li><Link href={href('/blog')}>{t('nav.blog')}</Link></li>
            </ul>
          </nav>

          <nav aria-labelledby="fCompany">
            <h2 id="fCompany" className="footer-h">{t('footer.company')}</h2>
            <ul>
              <li><Link href={href('/about')}>{t('nav.about')}</Link></li>
              <li><Link href={href('/team')}>{t('nav.team')}</Link></li>
              <li><Link href={href('/case-studies')}>{t('nav.caseStudies')}</Link></li>
              <li><Link href={href('/contact')}>{t('nav.contact')}</Link></li>
            </ul>
          </nav>

          {/* Docs and the two legal pages came across from the previous site.
              Nothing linked to them here, and a page nothing links to is a page
              nobody finds — the footer is where these belong anyway. */}
          <nav aria-labelledby="fMore">
            <h2 id="fMore" className="footer-h">{t('footer.more')}</h2>
            <ul>
              <li><Link href="/docs" lang="en" hrefLang="en">{t('footer.docs')}</Link></li>
              <li><Link href="/privacy" lang="en" hrefLang="en">{t('footer.privacy')}</Link></li>
              <li><Link href="/terms" lang="en" hrefLang="en">{t('footer.terms')}</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="footer-h">{t('footer.contact')}</h2>
            <ul className="footer-contact">
              <li><Icon name="mail" /><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
              <li><Icon name="phone" /><a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a></li>
              <li><Icon name="pin" /><span>{contact.locations}</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 StarSolution.ai — {t('footer.rights')}</p>
          <p className="footer-code"><strong className="font-mono">{contact.offer}</strong> — {t('footer.offer')}</p>
        </div>
      </div>
    </footer>
  );
}
