import type { Metadata } from 'next';
import { PageHead } from '@/components/PageHead';
import { Process, NightPanel } from '@/components/sections';
import { CTA } from '@/components/CTA';
import { site } from '@/lib/content';
import { alternates } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: alternates('en', '/process'), title: 'How it works' };

export default function ProcessPage() {
  return (
    <>
      <PageHead
        eyebrow="Simple process"
        title="Three steps to automated growth"
        lede="Most clients are live in under 14 days. Here is exactly how it runs."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'How it works' }]}
      />
      <Process steps={site.process} bare />
      <NightPanel log={site.nightLog} stats={site.nightStats} heading="h2" />
      <CTA />
    </>
  );
}
