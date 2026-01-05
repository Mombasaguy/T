import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, CheckCircle, X, Shield, Globe, Search, Mic, FileText, User } from 'lucide-react';
import { SiLinkedin, SiGithub } from 'react-icons/si';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/search?query=${encodeURIComponent(searchQuery)}`);
    } else {
      setLocation('/search');
    }
  };

  const proofChips = [
    "1B+ profiles indexed",
    "+50M refreshed weekly",
    "Natural language search"
  ];

  const howItWorks = [
    {
      title: "Describe the hire",
      description: "Type it like you'd tell a coworker."
    },
    {
      title: "We search the whole web",
      description: "1B+ public profiles, refreshed weekly."
    },
    {
      title: "Get ranked matches + reasons",
      description: "Every result explains why it matched."
    }
  ];

  const workflowBullets = [
    "Save and revisit top candidates",
    "Add notes, tags, and ratings",
    "Track hiring progress in one place",
    "Export candidate lists when needed"
  ];

  const traditionalTools = [
    "Boolean queries required",
    "Stale, outdated profiles",
    "No explanation of results",
    "Manual screening process"
  ];

  const talentPilotAdvantages = [
    "Natural language search",
    "Fresh data, refreshed weekly",
    "Every match explained",
    "Ranked by relevance"
  ];

  const trustBullets = [
    "Public data only",
    "Source transparency",
    "Explainable matching",
    "You control outreach"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="mx-auto max-w-3xl px-5 pb-12 pt-20 md:pt-28 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-gray-900">
          Search 1B+ profiles with one sentence.
        </h1>

        <p className="mt-4 text-base text-gray-600">
          Describe who you need. Get a ranked shortlist in seconds.
        </p>

        {/* Proof Chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {proofChips.map((chip, idx) => (
            <span 
              key={idx}
              className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700"
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-7">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Describe the person you need..."
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none"
              data-testid="input-hero-search"
            />

            <button
              type="button"
              onClick={handleSearch}
              className="mt-3 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
              data-testid="button-hero-search"
            >
              Find Candidates Now
            </button>
          </div>

        </div>
      </section>

      {/* Built for how recruiters actually search */}
      <section className="py-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Built for how recruiters actually search</h2>
          <p className="text-gray-600 mb-4">
            TalentPilot searches across a large index of public professional profiles, including:
          </p>

          {/* Platform Chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-700">
              <SiLinkedin className="w-4 h-4 text-[#0A66C2]" />
              LinkedIn
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-700">
              <SiGithub className="w-4 h-4" />
              GitHub
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-700">
              <Globe className="w-4 h-4 text-gray-500" />
              Blogs and writing
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-700">
              <User className="w-4 h-4 text-gray-500" />
              Portfolios and personal sites
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-700">
              <Mic className="w-4 h-4 text-gray-500" />
              Talks and publications
            </span>
          </div>

          <p className="text-gray-600 mb-6">
            Instead of relying on keywords or job titles alone, TalentPilot understands search intent, so you can describe candidates in plain language.
          </p>

          {/* Example Prompts */}
          <div className="space-y-3">
            <button
              onClick={() => setSearchQuery("Healthcare operations leaders who've led EHR rollouts")}
              className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors"
              data-testid="button-example-healthcare"
            >
              <div className="flex items-start gap-3">
                <Search className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">"Healthcare operations leaders who've led EHR rollouts"</p>
                  <p className="text-sm text-gray-500 mt-0.5">Finds operators with hands-on delivery experience—not just titles.</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSearchQuery("Product managers at fintech companies who write about design systems")}
              className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors"
              data-testid="button-example-fintech"
            >
              <div className="flex items-start gap-3">
                <Search className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">"Product managers at fintech companies who write about design systems"</p>
                  <p className="text-sm text-gray-500 mt-0.5">Surfaces PMs with real writing, portfolio work, and relevant experience.</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSearchQuery("Senior engineers who've spoken at React conferences")}
              className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors"
              data-testid="button-example-react"
            >
              <div className="flex items-start gap-3">
                <Search className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">"Senior engineers who've spoken at React conferences"</p>
                  <p className="text-sm text-gray-500 mt-0.5">Finds engineers who show up in talks, code, and professional profiles.</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Cards */}
      <section className="py-12 px-4 md:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How it works</h2>
          
          <div className="grid md:grid-cols-3 gap-4 text-left">
            {howItWorks.map((step, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-gray-200">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-medium mb-3">
                  {idx + 1}
                </span>
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why we're different</h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
            {/* Traditional Tools */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-500 mb-4">Traditional tools</h3>
              <ul className="space-y-2">
                {traditionalTools.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* TalentPilot */}
            <div className="bg-white rounded-xl p-5 border-2 border-gray-900">
              <h3 className="font-semibold text-gray-900 mb-4">TalentPilot</h3>
              <ul className="space-y-2">
                {talentPilotAdvantages.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-900">
                    <CheckCircle className="w-4 h-4 text-gray-900 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Features - Bullets */}
      <section className="py-12 px-4 md:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Built for real workflows</h2>
          <p className="text-gray-600 mb-6">Everything recruiters need, nothing they don't.</p>
          
          <ul className="space-y-2 inline-block text-left">
            {workflowBullets.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trust Section - Bullets */}
      <section className="py-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-gray-900" />
            <h2 className="text-2xl font-bold text-gray-900">Responsible sourcing, by design.</h2>
          </div>
          
          <ul className="space-y-2 inline-block text-left">
            {trustBullets.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 md:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Start finding candidates now
          </h2>
          <p className="text-gray-600 mb-6">
            No Boolean. No busywork. Just results.
          </p>
          <button 
            onClick={() => setLocation('/search')}
            className="px-8 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            data-testid="button-cta-search"
          >
            Find Candidates Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center text-gray-500 text-sm">
          <p className="font-medium text-gray-700">TalentPilot</p>
          <p className="mt-1">Modern candidate discovery for recruiting teams</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="/pricing" className="hover:text-gray-700 transition-colors">Pricing</a>
            <a href="/compliance" className="hover:text-gray-700 transition-colors">Compliance</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
