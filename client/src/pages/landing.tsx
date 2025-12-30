import { useState } from 'react';
import { useLocation } from 'wouter';
import { Globe, Zap, Brain, ArrowRight, CheckCircle, Mic, Star, Tag, FileText, Download, Mail, Shield, Users, Search, ListChecks } from 'lucide-react';
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

  const handleExampleSearch = (query: string) => {
    setLocation(`/search?query=${encodeURIComponent(query)}`);
  };

  const searchExamples = [
    "Healthcare operations leaders who've led EHR rollouts",
    "Product managers at fintech companies who write about design systems",
    "Senior engineers who've spoken at React conferences",
  ];

  const platforms = [
    { icon: SiLinkedin, label: "LinkedIn", color: "text-[#0A66C2]" },
    { icon: SiGithub, label: "GitHub", color: "text-gray-700" },
    { icon: Globe, label: "Blogs and writing", color: "text-gray-500" },
    { icon: Users, label: "Portfolios and personal sites", color: "text-gray-500" },
    { icon: Mic, label: "Talks and publications", color: "text-gray-500" },
  ];

  const exampleSearches = [
    {
      query: "Healthcare operations leaders who've led EHR rollouts",
      result: "Finds operators with hands-on delivery experience—not just titles."
    },
    {
      query: "Product managers at fintech companies who write about design systems",
      result: "Surfaces PMs with real writing, portfolio work, and relevant experience."
    },
    {
      query: "Senior engineers who've spoken at React conferences",
      result: "Finds engineers who show up in talks, code, and professional profiles."
    },
  ];

  const workflowFeatures = [
    { icon: Star, label: "Save candidates" },
    { icon: FileText, label: "Add notes and tags" },
    { icon: Tag, label: "Star and rate prospects" },
    { icon: ListChecks, label: "Track status" },
    { icon: Download, label: "Export to CSV" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="mx-auto max-w-3xl px-5 pb-12 pt-20 md:pt-28">
        <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-gray-900">
          Find the right candidates — without digging through noise.
        </h1>

        <p className="mt-4 text-base text-gray-600 leading-relaxed">
          TalentPilot helps recruiting teams proactively discover, evaluate, and prioritize qualified candidates across public professional profiles — not just resumes or job boards.
        </p>

        <p className="mt-3 text-sm text-gray-500">
          Describe the person you need. Get a clear, ranked shortlist in minutes.
        </p>

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

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="mb-2 text-xs font-medium text-gray-500">Or try searches like:</p>
              <div className="flex flex-wrap gap-2">
                {searchExamples.map((q, idx) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSearchQuery(q)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:border-gray-900 transition-colors"
                    data-testid={`button-example-${idx}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
            Recruiting isn't about finding people.<br />
            <span className="text-gray-500">It's about knowing who to contact.</span>
          </h2>
          
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl">
            Most recruiting tools return long lists and leave the judgment to you. TalentPilot highlights who stands out, explains why they're a fit, and helps you decide what to do next.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Built for how recruiters actually search
          </h2>
          <p className="text-base text-gray-600 mb-8">
            TalentPilot searches across a large index of public professional profiles, including:
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            {platforms.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">
                <p.icon className={`w-4 h-4 ${p.color}`} />
                <span>{p.label}</span>
              </div>
            ))}
          </div>

          <p className="text-base text-gray-600 mb-6">
            Instead of relying on keywords or job titles alone, TalentPilot understands search intent, so you can describe candidates in plain language.
          </p>

          <div className="space-y-3">
            {exampleSearches.map((example, idx) => (
              <div 
                key={idx} 
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => handleExampleSearch(example.query)}
                data-testid={`card-example-${idx}`}
              >
                <div className="flex items-start gap-3">
                  <Search className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-900 font-medium">"{example.query}"</p>
                    <p className="text-xs text-gray-500 mt-1">{example.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            A focused shortlist — not a long list
          </h2>
          <p className="text-base text-gray-600 mb-8">
            TalentPilot returns candidates who clearly match what you're looking for, ranked by relevance and explained in plain terms.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Why they surfaced</h3>
              <p className="text-sm text-gray-600">Each result explains why the candidate matches your search.</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Where it comes from</h3>
              <p className="text-sm text-gray-600">See the sources: LinkedIn, GitHub, blogs, talks, and more.</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">How close the match</h3>
              <p className="text-sm text-gray-600">Relevance scores show how closely they match your criteria.</p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">No guessing. No manual screening.</p>
        </div>
      </section>

      <section className="py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">See the whole person</h3>
              <p className="text-gray-600 text-sm">
                Go beyond resumes and titles. TalentPilot shows real work, projects, writing, talks, and career progression — what someone has actually done, not just how they describe themselves.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Ask better questions</h3>
              <p className="text-gray-600 text-sm">
                Stop guessing keywords or building complex filters. Search the way you naturally think about candidates — by experience, outcomes, and context.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Know who to reach out to</h3>
              <p className="text-gray-600 text-sm">
                Candidates come ranked by relevance, labeled with match indicators, and explained so you understand the reasoning. Decide who to contact with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Built for real recruiting workflows
          </h2>
          <p className="text-base text-gray-600 mb-8">
            Stay organized from first search to outreach. TalentPilot includes tools recruiters already expect:
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            {workflowFeatures.map((f, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700">
                <f.icon className="w-4 h-4 text-gray-500" />
                <span>{f.label}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500">
            It works like a smarter recruiting workspace — not another system to learn.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Outreach, made easier</h3>
              <p className="text-gray-600 text-sm mb-4">
                For teams that want it, TalentPilot can help draft professional, personalized outreach messages based on a candidate's background and your role.
              </p>
              <p className="text-gray-500 text-sm">
                You stay in control of tone, messaging, and when you reach out. Nothing is sent automatically.
              </p>
            </div>

            <div>
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Responsible sourcing</h3>
              <p className="text-gray-600 text-sm mb-4">
                TalentPilot uses publicly available professional information and is built to support responsible recruiting practices.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-gray-400" /> Clear source visibility</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-gray-400" /> No hidden data</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-gray-400" /> You control all outreach</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            From question to shortlist — without the busywork
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Instead of jumping between tools, tabs, and profiles, TalentPilot gives you a focused list of people who clearly match what you're looking for.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Spend less time searching. Spend more time hiring the right people.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Start finding candidates now
          </h2>
          <p className="text-base text-gray-600 mb-8">
            Describe the person you need. Get clear, explainable matches in minutes.
          </p>
          <button 
            onClick={() => setLocation('/search')}
            className="px-10 py-4 bg-gray-900 text-white text-base font-semibold rounded-xl hover:bg-gray-800 transition-colors inline-flex items-center gap-3"
            data-testid="button-cta-search"
          >
            Find Candidates Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center text-gray-500 text-sm">
          <p className="font-medium text-gray-700">TalentPilot</p>
          <p className="mt-1">Modern candidate discovery for recruiting teams</p>
        </div>
      </footer>
    </div>
  );
}
