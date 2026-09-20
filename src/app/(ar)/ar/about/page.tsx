import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { getContent, getDict, localeHref } from '@/lib/i18n';
import { alternates } from '@/lib/seo';

const locale = 'ar' as const;
const t = getDict(locale);

export const metadata: Metadata = {
  alternates: alternates(locale, '/about'),
  title: t('page.about.title'),
  description: t('page.about.lede'),
};

export const revalidate = 60;

export default function ArabicAboutPage() {
  const c = getContent(locale);
  const team = c.team.filter((m) => !m.hidden);
  return (
    <>
      <PageHead
        eyebrow={t('page.about.eyebrow')}
        title={t('page.about.title')}
        lede={t('page.about.lede')}
        crumbs={[{ href: localeHref(locale, '/'), label: t('crumbs.home') }, { label: t('page.about.crumb') }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="detail-layout">
            <div className="detail-body">
              <Reveal>
                <h2>{t('about.whatWeDo')}</h2>
                <ul className="detail-points">
                  <li><Icon name="check" /> {t('about.do1')}</li>
                  <li><Icon name="check" /> {t('about.do2')}</li>
                  <li><Icon name="check" /> {t('about.do3')}</li>
                  <li><Icon name="check" /> {t('about.do4')}</li>
                </ul>
                <h2>{t('about.whereTitle')}</h2>
                <p className="section-sub">{c.contact.locations}. {t('about.whereBody')}</p>
              </Reveal>
            </div>
            <aside className="detail-aside">
              <h2>{t('about.workWithUs')}</h2>
              <p>{t('about.workWithUsBody')}</p>
              <Link href={localeHref(locale, '/contact')} className="btn btn-primary btn-lg">{t('cta.audit')}</Link>
            </aside>
          </div>

          <h2 className="group-label mt-10">{t('about.theTeam')}</h2>
          <ul className="team-grid">
            {team.map((m) => (
              <li className="team-card" key={m.id}>
                <Link href={localeHref(locale, `/team/${m.slug}`)} className="flex flex-col items-center gap-1.5">
                  <span className="avatar" style={{ ['--a1' as string]: m.tone }}>{m.initials}</span>
                  <strong>{m.title}</strong>
                  <span>{m.role}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
