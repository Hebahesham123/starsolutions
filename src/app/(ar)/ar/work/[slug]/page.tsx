import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { BeforeAfter } from '@/components/BeforeAfter';
import { getContent, getDict, localeHref } from '@/lib/i18n';
import { alternates } from '@/lib/seo';

const locale = 'ar' as const;
const t = getDict(locale);

/**
 * A project page in Arabic.
 *
 * The captures, the mock frames and the dimensions in shots.json are keyed by
 * slug and shared with the English page — a project is versioned with the code,
 * not translated — so only the words around them change.
 */
const projects = () => getContent(locale).projects.filter((p) => !p.hidden);

export const revalidate = 60;

export function generateStaticParams() {
  return projects().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const project = projects().find((p) => p.slug === params.slug);
  const inEn = getContent('en').projects.some((p) => p.slug === params.slug);
  return {
    alternates: alternates(locale, `/work/${params.slug}`, { en: inEn }),
    title: project?.title ?? t('page.work.title'),
    description: project?.summary,
  };
}

export default function ArabicProjectPage({ params }: { params: { slug: string } }) {
  const project = projects().find((p) => p.slug === params.slug);
  if (!project) notFound();

  return (
    <>
      <PageHead
        eyebrow={project.badge}
        title={project.title}
        lede={project.summary}
        crumbs={[
          { href: localeHref(locale, '/'), label: t('crumbs.home') },
          { href: localeHref(locale, '/work'), label: t('page.work.crumb') },
          { label: project.title },
        ]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="detail-layout">
            <div className="detail-body">
              <Reveal>
                <BeforeAfter
                  locale={locale}
                  theme={project.theme}
                  slug={project.slug}
                  title={project.title}
                  label={`${t('cases.before')} / ${t('cases.after')} — ${project.title}`}
                />
                <h2>{t('work.whatWeDid')}</h2>
                <ul className="detail-points">
                  {project.points.map((p) => <li key={p}><Icon name="check" /> {p}</li>)}
                </ul>
              </Reveal>
            </div>
            <aside className="detail-aside">
              <h2>{t('work.visitTitle')}</h2>
              <p>{t('work.visitBody')}</p>
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
                {t('cta.visitSite')} <Icon name="link" className="h-4 w-4" />
              </a>
              <Link href={localeHref(locale, '/contact')} className="btn btn-ghost btn-lg mt-2 w-full">
                {t('cta.audit')}
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
