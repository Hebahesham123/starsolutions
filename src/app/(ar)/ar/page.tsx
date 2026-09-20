import { getContent, getDict } from '@/lib/i18n';

export default function ArabicHome() {
  const t = getDict('ar');
  const c = getContent('ar');
  return (
    <section className="section">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <h1>{t('hero.title1')}</h1>
        <p>{c.solutions.length}</p>
      </div>
    </section>
  );
}
