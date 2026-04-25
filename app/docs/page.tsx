'use client'

import Link from 'next/link'

export default function Docs() {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <h1 className="font-heading text-4xl font-bold text-heading mb-4">Documentation</h1>
        <p className="text-muted text-lg mb-12">Learn how to get the most out of Start Solution .ai</p>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Getting Started',
              desc: 'Set up your account and get your first automation running in 5 minutes',
              icon: '🚀',
              links: [
                'Create your account',
                'Connect your Shopify store',
                'Set up your first automation',
              ],
            },
            {
              title: 'Integrations',
              desc: 'Connect your favorite tools and platforms',
              icon: '🔌',
              links: [
                'Shopify integration',
                'Facebook & Instagram',
                'Google Ads',
                'Email Marketing',
              ],
            },
            {
              title: 'AI Chatbot',
              desc: 'Deploy an AI chatbot to answer customer questions 24/7',
              icon: '🤖',
              links: [
                'Set up chatbot',
                'Train with your FAQ',
                'Deploy on website',
              ],
            },
            {
              title: 'API Documentation',
              desc: 'Build custom integrations with our powerful API',
              icon: '⚙️',
              links: [
                'API Reference',
                'Webhooks',
                'Code Examples',
              ],
            },
            {
              title: 'Best Practices',
              desc: 'Maximize your results with proven strategies',
              icon: '⭐',
              links: [
                'Optimization tips',
                'Success stories',
                'Video tutorials',
              ],
            },
            {
              title: 'Troubleshooting',
              desc: 'Find solutions to common issues',
              icon: '🔧',
              links: [
                'FAQ',
                'Common errors',
                'Contact support',
              ],
            },
          ].map((section, index) => (
            <div key={index} className="bg-surface rounded-2xl p-8 border border-gray-200 hover:border-primary/30 transition-colors">
              <div className="text-4xl mb-4">{section.icon}</div>
              <h2 className="font-heading text-xl font-bold text-heading mb-2">{section.title}</h2>
              <p className="text-muted text-sm mb-6">{section.desc}</p>
              <ul className="space-y-2">
                {section.links.map((link, i) => (
                  <li key={i} className="text-primary font-semibold text-sm hover:text-primary-dark cursor-pointer">
                    → {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-20 bg-gradient-to-r from-primary/10 to-cta/10 rounded-2xl p-12 text-center">
          <h2 className="font-heading text-2xl font-bold text-heading mb-4">Can't find what you're looking for?</h2>
          <p className="text-muted text-lg mb-6">Our support team is here to help 24/7</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://wa.me/+201234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark"
            >
              Contact Support
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center px-6 py-3 bg-cta text-white font-bold rounded-lg hover:bg-cta-hover"
            >
              Read Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
