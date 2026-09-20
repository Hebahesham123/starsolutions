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
  alternates: alternates('ar', '/team'),
  title: t('page.team.title'),
  description: t('page.team.lede'),
};

export const revalidate = 60;

export default function TeamIndexPage() {
  const items = getContent(locale).team.filter((entry) => !entry.hidden);
  return (
    <>
      <PageHead
        eyebrow={t('page.team.eyebrow')}
        title={t('page.team.title')}
        lede={t('page.team.lede')}
        crumbs={[{ href: localeHref(locale, '/'), label: t('crumbs.home') }, { label: t('page.team.crumb') }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="index-grid">
            {items.map((item, i) => (
              <Reveal as="article" key={item.id} delay={i * 0.05}>
                <Link
                  href={localeHref(locale, `/team/${item.slug}`)}
                  className="index-card h-full"
                  style={{ ['--tone' as string]: item.tone }}
                >
                  {item.icon && <span className="index-icon"><Icon name={item.icon} /></span>}
                  <p className="index-badge">{item.badge ?? item.tag ?? item.type ?? item.role ?? item.eyebrow}</p>
                  <h2>{item.title}</h2>
                  <p>{item.short ?? item.summary}</p>
                  <span className="index-more">{t('cta.readMore')} <Icon name="arrow" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
