import { getDict, type Locale } from '@/lib/i18n';

/**
 * One plain paragraph under the home hero: what StarSolution does, for whom,
 * where. It carries the words the home <title> promises (the service and
 * Egypt) in visible text. Static server HTML below the hero, so nothing
 * shifts while the page loads.
 */
export function HomeIntro({ locale = 'en' }: { locale?: Locale }) {
  const t = getDict(locale);
  return (
    <section className="home-intro" aria-label={t('hero.eyebrow')}>
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <p className="home-intro-text">{t('home.intro')}</p>
      </div>
    </section>
  );
}
