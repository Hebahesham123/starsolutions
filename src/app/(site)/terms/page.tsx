import type { Metadata } from 'next';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { site } from '@/lib/content';
import { alternates } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: alternates('en', '/terms', { ar: false }),
  title: 'Terms of service',
  description: 'The terms that apply to using the Star Solution website.',
};

/**
 * Carried over from the previous site so the URL keeps working. As with the
 * privacy policy, the clauses are unchanged — only the layout is this site's.
 */
export default function TermsPage() {
  return (
    <>
      <PageHead
        eyebrow="Legal"
        title="Terms of service"
        lede="The terms that apply to using this website."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Terms' }]}
      />

      <section className="section detail-section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <Reveal className="legal-body">
            <h2>1. Acceptance of terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and
              provision of this agreement.
            </p>

            <h2>2. Disclaimer</h2>
            <p>
              The information provided on this website is for general informational purposes only. While we
              strive to keep the information up to date and correct, we make no representations or warranties
              of any kind, express or implied.
            </p>

            <h2>3. Limitation of liability</h2>
            <p>
              In no event shall Start Solution .ai, its vendors, or any of its content providers be liable for
              any damages (including, without limitation, damages for loss of data or profit) arising out of
              the use or inability to use the materials.
            </p>

            <h2>4. Accuracy of materials</h2>
            <p>
              The materials appearing on our website could include technical, typographical, or photographic
              errors. We do not warrant that any of the materials on our website are accurate, complete, or
              current.
            </p>

            <h2>5. Links</h2>
            <p>
              We have not reviewed all of the sites linked to our website and are not responsible for the
              contents of any such linked site.
            </p>

            <h2>6. Modifications</h2>
            <p>
              We may revise these terms of service for our website at any time without notice. By using this
              website, you are agreeing to be bound by the then current version of these terms of service.
            </p>

            <h2>7. Contact</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
            </p>

            <p className="legal-updated">Last updated: April 2026</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
