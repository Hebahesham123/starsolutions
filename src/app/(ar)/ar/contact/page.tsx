import type { Metadata } from 'next';
import { PageHead } from '@/components/PageHead';
import { ContactForm } from '@/components/ContactForm';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { getContent, getDict, localeHref } from '@/lib/i18n';
import { alternates } from '@/lib/seo';

const locale = 'ar' as const;
const t = getDict(locale);

export const metadata: Metadata = {
  alternates: alternates('ar', '/contact'), title: t('page.contact.title'), description: t('page.contact.lede') };

export const revalidate = 60;

export default function ArabicContactPage() {
  const { contact } = getContent(locale);
  return (
    <>
      <PageHead
        eyebrow={t('page.contact.eyebrow')}
        title={t('page.contact.title')}
        lede={t('page.contact.lede')}
        crumbs={[{ href: localeHref(locale, '/'), label: t('crumbs.home') }, { label: t('page.contact.crumb') }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="contact-grid">
            <Reveal>
              <h2 className="section-title">{t('contact.talkToUs')}</h2>
              <ul className="contact-list">
                <li><a href={`mailto:${contact.email}`}><Icon name="mail" /> {contact.email}</a></li>
                <li><a href={`tel:${contact.phone.replace(/\s/g, '')}`}><Icon name="phone" /> {contact.phone}</a></li>
                <li><a href={contact.whatsapp}><Icon name="whatsapp" /> {t('cta.whatsapp')}</a></li>
                <li><span><Icon name="pin" /> {contact.locations}</span></li>
              </ul>
            </Reveal>
            <Reveal delay={0.1}><ContactForm locale={locale} /></Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
