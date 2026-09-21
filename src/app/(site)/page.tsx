import { Hero } from '@/components/Hero';
import { ResultsPanel } from '@/components/ResultsPanel';
import { CTA } from '@/components/CTA';
import { Goals, Systems, Process, NightPanel, CaseStudies, Work, Automations, Testimonials, Team } from '@/components/sections';
import type { Metadata } from 'next';
import {
  site, getGoals, getCaseStudies, getSystems, getAutomations, getTeam,
  getTestimonials, getProjects,
} from '@/lib/content';
import { alternates } from '@/lib/seo';

export const metadata: Metadata = { alternates: alternates('en', '/') };

export default async function HomePage() {
  // getSolutions() is gone with the bento it fed: it was still a Supabase
  // round trip on every render for a section that no longer exists. The
  // /solutions page and its route are untouched.
  const [goals, cases, systems, automations, team, testimonials, projects] = await Promise.all([
    getGoals(), getCaseStudies(), getSystems(), getAutomations(),
    getTeam(), getTestimonials(), getProjects(),
  ]);

  return (
    <>
      <Hero nodes={site.heroNodes} stats={site.heroStats} platforms={site.platforms} />
      <Goals goals={goals} />
      <Automations automations={automations} platforms={site.platforms} />

      {/* No heading. The panel opens with its own kicker and a figure the
          size of the screen, so a framed title above it repeated that and cost
          a third of the section's height before anything was shown. The name
          moves to aria-label, since the element that carried it is gone. */}
      <section id="results" className="section section-soft stats-section" aria-label="Proven results">
        <div className="starfield starfield-dim" aria-hidden="true" />
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <ResultsPanel charts={site.charts} figures={site.figures} />
        </div>
      </section>

      <Systems systems={systems} />
      <NightPanel log={site.nightLog} stats={site.nightStats} />
      <CaseStudies cases={cases} />
      <Work projects={projects} />
      <Process steps={site.process} />
      <Testimonials items={testimonials} />
      <Team team={team} />
      <CTA />
    </>
  );
}
