import { useState } from 'react';
import { useLocation } from 'wouter';
import { Globe, Zap, Brain, ArrowRight, CheckCircle, Mic } from 'lucide-react';
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

  const examples = [
    "Senior engineers in SF who've spoken at React conferences",
    "Product managers at fintech companies who write about design systems",
    "Healthcare operations leaders who've led EHR rollouts",
  ];

  const searchExamples = [
    {
      query: "Senior engineers in SF who've spoken at React conferences",
      result: "Finds engineers who show up in talks, code, and professional profiles."
    },
    {
      query: "Product managers at fintech companies who write about design systems",
      result: "Surfaces PMs with real writing, portfolio work, and relevant experience."
    },
    {
      query: "Healthcare operations leaders who've led EHR rollouts across multiple hospitals",
      result: "Identifies operators with hands-on delivery experience—not just titles."
    },
    {
      query: "Policy analysts who've helped write federal guidance on privacy or cybersecurity",
      result: "Finds people with published work, government experience, and real influence."
    },
    {
      query: "Design leaders who've built and scaled design systems in regulated industries",
      result: "Surfaces designers with proven systems work and leadership history."
    },
    {
      query: "Clinical researchers who've published outcomes studies in oncology",
      result: "Finds researchers with peer-reviewed publications and institutional credibility."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-20 md:pt-28">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-gray-900">
          Searches that only work here
        </h1>

        <p className="mt-4 text-sm text-gray-600">
          Describe the person you need — not keywords — and see who actually fits and why.
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
                {examples.map((q, idx) => (
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

        <div className="mt-6">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <SiLinkedin className="w-4 h-4 text-[#0A66C2]" />
              <span>LinkedIn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <SiGithub className="w-4 h-4 text-gray-700" />
              <span>GitHub</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-gray-500" />
              <span>Personal Sites</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-gray-500" />
              <span>Conference Talks</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Looks across public profiles, writing, talks, and real work—not just resumes.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Searches That Only Work Here
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12">
            Ask for people the way you naturally think about them.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {searchExamples.map((example, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => handleExampleSearch(example.query)}
                data-testid={`card-use-case-${idx}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-medium text-xs">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium text-sm mb-2">"{example.query}"</div>
                    <div className="text-gray-500 text-xs flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400" />
                      <span>{example.result}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
              Recruiting isn't about finding people.<br />
              <span className="text-gray-600">It's about knowing who to contact.</span>
            </h2>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
              Most recruiting tools give you long lists and leave the judgment to you.
              Candidate Command Center shows you who stands out, why they're a fit, and what to do next.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">See the whole person</h3>
              <p className="text-gray-600">
                Get a clear picture of what someone has actually done—across their work, writing, talks, and career.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Ask better questions</h3>
              <p className="text-gray-600">
                Search in plain language instead of guessing keywords or building filters.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Know who to reach out to</h3>
              <p className="text-gray-600">
                Candidates come back ranked and explained, so you're not guessing or manually screening.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            From question to shortlist—without the busywork
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Instead of jumping between tools, tabs, and profiles, you get a focused list of people who clearly match what you're looking for.
          </p>
        </div>
      </section>

      <section className="py-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Start finding candidates now
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Describe the person you need. Get clear, explainable matches in minutes.
          </p>
          <button 
            onClick={() => setLocation('/search')}
            className="px-12 py-4 bg-gray-900 text-white text-lg font-semibold rounded-xl hover:bg-gray-800 transition-colors inline-flex items-center gap-3"
            data-testid="button-cta-search"
          >
            Find Candidates Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center text-gray-500 text-sm">
          <p>Candidate Command Center</p>
        </div>
      </footer>
    </div>
  );
}
