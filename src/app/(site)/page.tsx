import { Hero } from '@/components/Hero';
import { ResultsPanel } from '@/components/ResultsPanel';
import { CTA } from '@/components/CTA';
import { SectionHead, Goals, Systems, Process, NightPanel, CaseStudies, Work, Automations, Testimonials, Team } from '@/components/sections';
import {
  site, getGoals, getCaseStudies, getSystems, getAutomations, getTeam,
  getTestimonials, getProjects,
} from '@/lib/content';

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
      <Process steps={site.process} />

      <section id="results" className="section section-soft stats-section" aria-labelledby="statsTitle">
        <div className="starfield starfield-dim" aria-hidden="true" />
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          {/* The reference frames the heading rather than letting it sit on the
              page, which on a dark ground is how it separates from the panel
              below. Scoped to this section — nothing else on the site does it. */}
          <div className="section-head-card">
            <SectionHead id="statsTitle" eyebrow="Proven results" title="Numbers that speak for themselves" sub="Real client data." />
          </div>
          <ResultsPanel charts={site.charts} figures={site.figures} />
        </div>
      </section>

      <Systems systems={systems} />
      <NightPanel log={site.nightLog} stats={site.nightStats} />
      <CaseStudies cases={cases} />
      <Work projects={projects} />
      <Automations automations={automations} platforms={site.platforms} />
      <Testimonials items={testimonials} />
      <Team team={team} />
      <CTA />
    </>
  );
}
