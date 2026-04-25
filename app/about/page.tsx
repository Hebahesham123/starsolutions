'use client'

import Link from 'next/link'

export default function About() {
  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-heading mb-4">
            About Start Solution
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            We're on a mission to help every business owner automate their work and grow their revenue.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="font-heading text-3xl font-bold text-heading mb-4">Our Story</h2>
              <p className="text-muted text-lg leading-relaxed mb-4">
                Founded in 2024, Start Solution was created to solve a simple problem: business owners were drowning in repetitive tasks.
              </p>
              <p className="text-muted text-lg leading-relaxed mb-4">
                We built a platform that automates everything — from orders to marketing to customer support. So far, we've helped 150+ businesses scale their revenue 3x while saving 20+ hours per week.
              </p>
              <p className="text-muted text-lg leading-relaxed">
                Today, our mission remains the same: empower entrepreneurs with AI to do what matters most.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-cta/10 rounded-2xl p-12 flex items-center justify-center h-96">
              <div className="text-6xl">🚀</div>
            </div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl font-bold text-heading mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: '💡', title: 'Innovation', desc: 'We stay ahead of technology trends to serve you better.' },
                { icon: '✨', title: 'Results', desc: 'Your growth is our success. We\'re obsessed with your ROI.' },
                { icon: '🤝', title: 'Trust', desc: 'Transparency and integrity in everything we do.' },
              ].map((value, index) => (
                <div key={index} className="bg-surface rounded-2xl p-8 text-center">
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <h3 className="font-heading text-xl font-bold text-heading mb-2">{value.title}</h3>
                  <p className="text-muted">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <h2 className="font-heading text-3xl font-bold text-heading mb-12 text-center">Our Team</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Heba Hesham', role: 'Senior Web Developer' },
                { name: 'Hams', role: 'Software Engineer' },
                { name: 'Mera', role: 'Software Engineer' },
                { name: 'Ganna', role: 'Content Creator' },
                { name: 'Ebtsam', role: 'Social Media Creator' },
                { name: 'Amira', role: 'Customer Support' },
                { name: 'Jumana', role: 'Customer Support' },
              ].map((member, index) => (
                <div key={index} className="bg-surface rounded-xl p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-cta mx-auto mb-4 flex items-center justify-center text-2xl text-white font-bold">
                    {member.name[0]}
                  </div>
                  <h3 className="font-heading font-bold text-heading">{member.name}</h3>
                  <p className="text-muted text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-white text-center">
        <h2 className="font-heading text-3xl font-bold mb-4">Ready to join 150+ growing businesses?</h2>
        <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">Let's automate your business and grow together.</p>
        <Link
          href="/#contact"
          className="inline-flex items-center justify-center px-8 py-4 bg-cta text-white font-bold rounded-lg hover:bg-cta-hover"
        >
          Get Started
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>
    </div>
  )
}
