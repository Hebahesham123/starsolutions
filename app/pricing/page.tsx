'use client'

import Link from 'next/link'

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 fade-up">
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Pricing</p>
            <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-heading mb-4">
              Plans for every business size
            </h1>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'Free',
                period: 'Forever',
                desc: 'Perfect to get started',
                features: [
                  'Basic automation setup',
                  'Up to 100 orders/month',
                  'Email support',
                  'Basic analytics',
                ],
                cta: 'Get Started',
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
                cta: 'Start Free Trial',
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'Let\'s talk',
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
                cta: 'Contact Sales',
                highlight: false,
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl border transition-all fade-up ${
                  ['', 'd1', 'd2'][index]
                } ${
                  plan.highlight
                    ? 'border-primary bg-gradient-to-br from-primary/5 to-primary-dark/5 ring-2 ring-primary shadow-xl'
                    : 'border-gray-200 bg-white hover:border-primary/30'
                }`}
              >
                <div className="p-6 sm:p-8">
                  {plan.highlight && (
                    <div className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                      Most Popular
                    </div>
                  )}
                  <h3 className="font-heading text-2xl font-bold text-heading mb-2">{plan.name}</h3>
                  <p className="text-muted text-sm mb-6">{plan.desc}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="font-heading text-4xl font-bold text-heading">{plan.price}</span>
                      <span className="text-muted text-sm">/{plan.period}</span>
                    </div>
                  </div>

                  <Link
                    href="#contact"
                    className={`w-full block text-center py-3 rounded-lg font-bold transition-colors mb-6 ${
                      plan.highlight
                        ? 'bg-cta text-white hover:bg-cta-hover'
                        : 'bg-gray-100 text-heading hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  <div className="space-y-4">
                    {plan.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-body">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto mt-20">
            <h2 className="font-heading text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Can I change plans anytime?',
                  a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
                },
                {
                  q: 'Do you offer refunds?',
                  a: 'We offer a 14-day money-back guarantee. If you\'re not satisfied, we\'ll refund you. No questions asked.',
                },
                {
                  q: 'Is there a setup fee?',
                  a: 'No setup fees. We handle everything for free during onboarding.',
                },
                {
                  q: 'Do you work with my current software?',
                  a: 'We integrate with Shopify, WooCommerce, Facebook, Instagram, TikTok, Google Ads, and 500+ other platforms.',
                },
              ].map((faq, index) => (
                <div key={index} className="bg-surface rounded-lg border border-gray-200 p-6">
                  <h3 className="font-heading font-bold text-heading mb-2">{faq.q}</h3>
                  <p className="text-muted text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold mb-4">Ready to grow your business?</h2>
          <p className="text-white/80 text-lg mb-8">Start with a free plan or get a personalized demo today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-cta text-white font-bold rounded-lg hover:bg-cta-hover"
            >
              Get Started Free
            </Link>
            <a
              href="https://calendar.app.google.com/calendar/u/0/r"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-lg hover:bg-white/20"
            >
              Schedule Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
