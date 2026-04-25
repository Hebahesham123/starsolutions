export default function Privacy() {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <h1 className="font-heading text-4xl font-bold text-heading mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-body">
          <section>
            <h2 className="font-heading text-2xl font-bold text-heading mb-4">1. Introduction</h2>
            <p>
              Start Solution .ai ("Company", "we", "our", or "us") operates the website and provides services to help automate your business.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-heading mb-4">2. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Name and contact information</li>
              <li>Company information</li>
              <li>Messages and inquiries</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-heading mb-4">3. How We Use Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Provide and improve our services</li>
              <li>Respond to your inquiries</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Analyze usage patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-heading mb-4">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-heading mb-4">5. Contact Us</h2>
            <p>
              If you have questions about this privacy policy, please contact us at info@starsolution.ai
            </p>
          </section>

          <p className="text-muted text-sm mt-12">Last updated: April 2026</p>
        </div>
      </div>
    </div>
  )
}
