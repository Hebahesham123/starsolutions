import { Hero } from '@/components/Hero';
import { HomeIntro } from '@/components/HomeIntro';
import { ResultsPanel } from '@/components/ResultsPanel';
import { CTA } from '@/components/CTA';
import { Goals, Systems, Process, NightPanel, CaseStudies, Work, Automations, Testimonials, Team } from '@/components/sections';
import type { Metadata } from 'next';
import {
  site, getGoals, getSolutions, getCaseStudies, getSystems, getAutomations, getTeam,
  getTestimonials, getProjects,
} from '@/lib/content';
import { alternates, withSeo } from '@/lib/seo';
import { JsonLd, professionalService } from '@/lib/schema';

export const metadata: Metadata = withSeo({ alternates: alternates('en', '/') });

export default async function HomePage() {
  // Solutions feed the row of links under the goals (one per solution page).
  const [goals, solutions, cases, systems, automations, team, testimonials, projects] = await Promise.all([
    getGoals(), getSolutions(), getCaseStudies(), getSystems(), getAutomations(),
    getTeam(), getTestimonials(), getProjects(),
  ]);

  return (
    <>
      <Hero nodes={site.heroNodes} stats={site.heroStats} platforms={site.platforms} />
      <HomeIntro />
      <Goals goals={goals} solutions={solutions} />
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
      <JsonLd data={professionalService('en')} />
    </>
  );
}
