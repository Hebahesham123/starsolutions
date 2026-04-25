'use client'

import ContactForm from '@/components/ContactForm'

export default function Contact() {
  return (
    <div className="min-h-screen bg-white pt-20">
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-heading mb-4">
              Get in Touch
            </h1>
            <p className="text-muted text-lg">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: '📧',
                title: 'Email',
                content: 'info@starsolution.ai',
                link: 'mailto:info@starsolution.ai',
              },
              {
                icon: '📞',
                title: 'Phone',
                content: '+20 123 456 7890',
                link: 'tel:+201234567890',
              },
              {
                icon: '📍',
                title: 'Location',
                content: 'USA & UAE',
                link: '#',
              },
            ].map((contact, index) => (
              <a
                key={index}
                href={contact.link}
                className="bg-surface rounded-xl p-6 text-center hover:border-primary border-2 border-transparent transition-colors"
              >
                <div className="text-4xl mb-3">{contact.icon}</div>
                <h3 className="font-heading font-bold text-heading mb-2">{contact.title}</h3>
                <p className="text-muted">{contact.content}</p>
              </a>
            ))}
          </div>

          <ContactForm />
        </div>
      </section>
    </div>
  )
}
