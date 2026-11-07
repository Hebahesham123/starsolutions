import { JsonLd, faqPage, type FaqItem } from '@/lib/schema';
import { getDict, type Locale } from '@/lib/i18n';

/**
 * Questions and answers, as native <details> elements, plus the matching
 * FAQPage structured data.
 *
 * Server-rendered and JavaScript-free on purpose: every answer is in the HTML
 * for crawlers and screen readers, nothing starts at opacity 0, and a panel
 * only opens on a click, so it can never shift the layout during load. The
 * markup and the JSON-LD come from the same items, so they cannot disagree.
 */
export function Faq({
  items, locale = 'en', path, embedded = false,
}: {
  items: FaqItem[];
  locale?: Locale;
  /** Locale-free path of the page, for the JSON-LD url. */
  path: string;
  /** Inside an article column (blog posts) rather than as its own full-width
   *  section: same list and JSON-LD, with the column's own h2 style. */
  embedded?: boolean;
}) {
  if (items.length === 0) return null;
  const t = getDict(locale);
  const list = (
    <div className="faq-list">
      {items.map((item) => (
        <details key={item.q} className="faq-item">
          <summary className="faq-q">
            <span>{item.q}</span>
            <span className="faq-icon" aria-hidden="true" />
          </summary>
          <p className="faq-a">{item.a}</p>
        </details>
      ))}
    </div>
  );

  if (embedded) {
    return (
      <section className="faq-embedded" aria-labelledby="faqTitle">
        <h2 id="faqTitle">{t('detail.faq')}</h2>
        {list}
        <JsonLd data={faqPage(items, locale, path)} />
      </section>
    );
  }

  return (
    <section className="section faq-section" aria-labelledby="faqTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <h2 id="faqTitle" className="section-title faq-title">{t('detail.faq')}</h2>
        {list}
      </div>
      <JsonLd data={faqPage(items, locale, path)} />
    </section>
  );
}
