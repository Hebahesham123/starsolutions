import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Plans for every business size. Start free, scale as you grow.',
};

/**
 * Carried over from the previous site so the URL keeps working. Plans, prices
 * and answers are exactly as they were published — those are commitments, not
 * copy to improve while moving house.
 *
 * Two things could not come across as they were. The old page sent every button
 * to `#contact`, an anchor on a page that no longer exists here, and the demo
 * button went to a bare Google Calendar URL rather than to a booking. Both now
 * point at /contact and at the WhatsApp number in site.json — the same places
 * every other call to action on this site goes.
 */
const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    desc: 'Perfect to get started',
    features: [
      'Basic automation setup',
      'Up to 100 orders/month',
      'Email support',
      'Basic analytics',
    ],
    cta: 'Get started',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$297',
    period: 'per month',
    desc: 'For growing businesses',
    features: [
      'Advanced automation',
      'Up to 10K orders/month',
      'Priority support',
      'Advanced analytics',
      'AI chatbot',
      'Social media automation',
      'Custom integrations',
    ],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: "let's talk",
    desc: 'For scaling brands',
    features: [
      'Everything in Growth',
      'Unlimited orders',
      '24/7 phone support',
      'Dedicated account manager',
      'Custom API access',
      'White-label options',
      'SLA guarantee',
    ],
    cta: 'Contact sales',
    highlight: false,
  },
];

const FAQ = [
  {
    q: 'Can I change plans anytime?',
    a: 'Yes. You can upgrade or downgrade at any time, and changes take effect immediately.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 14-day money-back guarantee. If you are not satisfied we will refund you, no questions asked.',
  },
  {
    q: 'Is there a setup fee?',
    a: 'No setup fees. We handle everything for free during onboarding.',
  },
  {
    q: 'Do you work with my current software?',
    a: 'We integrate with Shopify, WooCommerce, Facebook, Instagram, TikTok, Google Ads and 500+ other platforms.',
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHead
        eyebrow="Pricing"
        title="Plans for every business size"
        lede="Start free, scale as you grow. No hidden fees."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Pricing' }]}
      />

      <section className="section detail-section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <ul className="plan-grid">
            {PLANS.map((plan, i) => (
              <Reveal as="li" key={plan.name} delay={i * 0.06}>
                <article className={`plan-card${plan.highlight ? ' is-featured' : ''}`}>
                  {plan.highlight && <p className="plan-flag">Most popular</p>}
                  <h2>{plan.name}</h2>
                  <p className="plan-desc">{plan.desc}</p>
                  <p className="plan-price">
                    {plan.price} <span>/{plan.period}</span>
                  </p>
                  <Link
                    href="/contact"
                    className={`btn ${plan.highlight ? 'btn-primary' : 'btn-ghost'} btn-lg w-full`}
                  >
                    {plan.cta}
                  </Link>
                  <ul className="plan-features">
                    {plan.features.map((f) => (
                      <li key={f}><Icon name="check" /> {f}</li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </ul>

          <h2 className="group-label plan-faq-head">Frequently asked questions</h2>
          <ul className="plan-faq">
            {FAQ.map((item, i) => (
              <Reveal as="li" key={item.q} delay={i * 0.05}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </Reveal>
            ))}
          </ul>

          <Reveal className="plan-cta">
            <h2>Ready to grow your business?</h2>
            <p>Start with a free audit, or talk it through on WhatsApp.</p>
            <div className="plan-cta-actions">
              <Link href="/contact" className="btn btn-primary btn-lg">
                Get free audit <Icon name="arrow" className="h-[18px] w-[18px]" />
              </Link>
              <a href={site.contact.whatsapp} className="btn btn-ghost btn-lg">
                <Icon name="whatsapp" className="h-5 w-5 text-[#25D366]" /> WhatsApp us
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
