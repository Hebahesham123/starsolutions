import type { Metadata } from 'next';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { site } from '@/lib/content';
import { alternates } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: alternates('en', '/privacy', { ar: false }),
  title: 'Privacy policy',
  description: 'What Star Solution collects, why, and how to reach us about it.',
};

/**
 * Carried over from the previous site so the URL keeps working.
 *
 * The wording is the wording that was published — a privacy policy is a
 * statement someone relied on, not copy to rewrite while moving it. Only the
 * layout changed: it uses this site's page head and prose styles instead of the
 * old one's utility classes, and the contact address comes from site.json so it
 * cannot drift from the address in the footer.
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHead
        eyebrow="Legal"
        title="Privacy policy"
        lede="What we collect, why we collect it, and who to ask about it."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Privacy' }]}
      />

      <section className="section detail-section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <Reveal className="legal-body">
            <h2>1. Introduction</h2>
            <p>
              Star Solution .ai (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates
              the website and provides services to help automate your business.
            </p>

            <h2>2. Information we collect</h2>
            <p>We collect information you provide directly to us, such as:</p>
            <ul>
              <li>Name and contact information</li>
              <li>Company information</li>
              <li>Messages and inquiries</li>
              <li>Usage data and analytics</li>
            </ul>

            <h2>3. How we use information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and improve our services</li>
              <li>Respond to your inquiries</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Analyze usage patterns</li>
            </ul>

            <h2>4. Data security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, no
              method of transmission over the Internet is 100% secure.
            </p>

            <h2>5. Advertising and measurement</h2>
            <p>
              We use the Meta Pixel and Meta Conversions API to measure how our ads perform and to show
              relevant ads on Facebook and Instagram. These tools may use cookies and receive information
              such as pages you visit, your IP address and browser details. When you submit a form, your
              email address and phone number are hashed (converted into an unreadable code) before being
              shared with Meta for matching. You can control ad preferences in your Facebook or Instagram
              settings.
            </p>

            <h2>6. Contact us</h2>
            <p>
              If you have questions about this privacy policy, please contact us at{' '}
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
            </p>

            <p className="legal-updated">Last updated: April 2026</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
