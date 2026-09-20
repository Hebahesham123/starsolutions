import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { ProjectCard } from '@/components/ProjectCard';
import { SystemCard } from '@/components/ui/SystemCard';
import { autoIcon, autoTone } from '@/components/sections';
import { getContent, getDict, localeHref } from '@/lib/i18n';
import { alternates } from '@/lib/seo';

const locale = 'ar' as const;
const t = getDict(locale);

export const metadata: Metadata = {
  alternates: alternates(locale, '/work'),
  title: t('page.work.title'),
  description: t('page.work.lede'),
};

export const revalidate = 60;

export default function ArabicWorkPage() {
  const c = getContent(locale);
  const projects = c.projects.filter((p) => !p.hidden);
  const systems = c.systems.filter((s) => !s.hidden);
  const automations = c.automations.filter((a) => !a.hidden);

  return (
    <>
      <PageHead
        eyebrow={t('page.work.eyebrow')}
        title={t('page.work.title')}
        lede={t('page.work.lede')}
        crumbs={[{ href: localeHref(locale, '/'), label: t('crumbs.home') }, { label: t('page.work.crumb') }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <h2 className="group-label">{t('work.live')}</h2>
          <div className="live-grid">
            {projects.map((p, i) => (
              <ProjectCard locale={locale} key={p.id} project={p} delay={i * 0.08} heading="h3" />
            ))}
          </div>

          <h2 className="group-label">{t('work.systems')}</h2>
          <ul className="system-list">
            {systems.map((s, i) => (
              <Reveal as="li" key={s.id} delay={i * 0.05}>
                <SystemCard system={s} index={i} heading="h3" locale={locale} />
              </Reveal>
            ))}
          </ul>

          <h2 className="group-label">{t('work.automations')}</h2>
          <Reveal as="ul" className="auto-grid">
            {automations.map((a, i) => (
              <li key={a.id}>
                <Link
                  href={localeHref(locale, `/automations/${a.slug}`)}
                  className="auto-card block"
                  style={{ ['--g1' as string]: a.tone ?? autoTone(i) }}
                >
                  <span className="auto-icon"><Icon name={a.icon ?? autoIcon(i)} /></span>
                  <div className="auto-text">
                    <h3>{a.title}</h3>
                    <p>{a.summary}</p>
                  </div>
                  <span className="auto-go" aria-hidden="true"><Icon name="arrow" /></span>
                </Link>
              </li>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
