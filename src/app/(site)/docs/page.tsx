import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'How to get the most out of Star Solution — setup, integrations, the AI chatbot and the API.',
};

/**
 * Carried over from the previous site so the URL keeps working.
 *
 * The topics are the ones that were published. What changed is that they are no
 * longer dressed as links: the old page styled every line in blue with a
 * pointer cursor and an arrow, but none of them had an href — six cards of
 * things that look clickable and do nothing. They are a contents list of what
 * each topic covers until the pages behind them exist, and the two buttons at
 * the bottom, which do go somewhere, are the way to get an answer meanwhile.
 *
 * Icons from this site's set rather than emoji, which render differently on
 * every platform and sat oddly beside everything else here.
 */
const TOPICS = [
  {
    icon: 'play',
    title: 'Getting started',
    desc: 'Set up your account and get your first automation running in five minutes.',
    covers: ['Create your account', 'Connect your Shopify store', 'Set up your first automation'],
  },
  {
    icon: 'link',
    title: 'Integrations',
    desc: 'Connect your favourite tools and platforms.',
    covers: ['Shopify', 'Facebook and Instagram', 'Google Ads', 'Email marketing'],
  },
  {
    icon: 'bot',
    title: 'AI chatbot',
    desc: 'Deploy an AI chatbot to answer customer questions around the clock.',
    covers: ['Set up the chatbot', 'Train it on your FAQ', 'Deploy it on your site'],
  },
  {
    icon: 'build',
    title: 'API documentation',
    desc: 'Build custom integrations with our API.',
    covers: ['API reference', 'Webhooks', 'Code examples'],
  },
  {
    icon: 'star',
    title: 'Best practices',
    desc: 'Get more out of what you have running.',
    covers: ['Optimisation tips', 'Success stories', 'Video tutorials'],
  },
  {
    icon: 'search',
    title: 'Troubleshooting',
    desc: 'Solutions to the things that come up most.',
    covers: ['FAQ', 'Common errors', 'Contacting support'],
  },
];

const TONES = ['#3B82F6', '#34D399', '#7C6CFF', '#38BDF8', '#FBBF24', '#F472B6'];

export default function DocsPage() {
  return (
    <>
      <PageHead
        eyebrow="Documentation"
        title="How it all works"
        lede="Setup, integrations, the AI chatbot and the API — and who to ask when the answer is not here."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Docs' }]}
      />

      <section className="section detail-section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <ul className="index-grid">
            {TOPICS.map((t, i) => (
              <Reveal as="li" key={t.title} delay={i * 0.05}>
                <article className="index-card h-full" style={{ ['--tone' as string]: TONES[i % TONES.length] }}>
                  <span className="index-icon"><Icon name={t.icon} /></span>
                  <h2>{t.title}</h2>
                  <p>{t.desc}</p>
                  <ul className="doc-covers">
                    {t.covers.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </article>
              </Reveal>
            ))}
          </ul>

          <Reveal className="page-cta">
            <h2>Cannot find what you are looking for?</h2>
            <p>Ask us directly — we answer within a business day.</p>
            <div className="page-cta-actions">
              <a href={site.contact.whatsapp} className="btn btn-primary btn-lg">
                <Icon name="whatsapp" className="h-5 w-5" /> Contact support
              </a>
              <Link href="/blog" className="btn btn-ghost btn-lg">
                Read the blog <Icon name="arrow" className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
