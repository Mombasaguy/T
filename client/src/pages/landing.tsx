import { useState } from 'react';
import { useLocation } from 'wouter';
import { Globe, Zap, Brain, ArrowRight, CheckCircle } from 'lucide-react';
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
    "Directors of engineering who contribute to open source",
    "ML engineers who publish papers or technical blogs",
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="mx-auto max-w-3xl px-5 pb-14 pt-20 md:pt-28">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-gray-900">
          Get ranked, interview-ready candidates in minutes.
        </h1>

        <p className="mt-4 text-sm text-gray-600">
          Powered by a new generation of internet-scale people search, now applied to recruiting.
        </p>

        <div className="mt-7">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Describe the person you need, not keywords"
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

            <p className="mt-3 text-center text-xs text-gray-500">
              Searches across LinkedIn, GitHub, blogs, portfolios, and live professional activity.
            </p>

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

        <p className="text-xs text-gray-400 mt-8">
          Built for recruiters who need confidence under time pressure.
        </p>
      </section>

      <section className="py-24 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
              Recruiting is not a search problem.<br />
              <span className="text-gray-600">It is a synthesis problem.</span>
            </h2>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
              Most recruiting tools stop at retrieval. Candidate Command Center goes further by synthesizing fragmented professional signal into actionable judgment—so you know who to contact, why they matter, and what to do next.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Signal Coverage</h3>
              <p className="text-gray-600">
                See the full picture, not just one platform.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Intent Resolution</h3>
              <p className="text-gray-600">
                Ask the question the way recruiters think.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Action Compression</h3>
              <p className="text-gray-600">
                From search to outreach in one motion.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl md:text-4xl font-bold text-white mb-4">
            2 minutes per candidate
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Searches across more than a billion public professional profiles — then delivers ranked, interview-ready candidates in minutes.
          </p>
        </div>
      </section>

      <section className="py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Searches That Only Work Here
          </h2>
          <p className="text-lg text-gray-600 text-center mb-16">
            Natural language queries that find candidates others miss
          </p>

          <div className="space-y-4">
            {[
              {
                query: "Senior engineers in SF who've spoken at React conferences",
                result: "Finds engineers with conference talks, GitHub activity, and LinkedIn presence"
              },
              {
                query: "Product managers at fintech companies who write about design systems",
                result: "Shows PMs with blog posts, portfolio work, and career progression"
              },
              {
                query: "Directors of engineering who contribute to open source projects",
                result: "Identifies leaders with GitHub contributions and professional profiles"
              },
              {
                query: "ML engineers who've published papers or write technical blogs",
                result: "Surfaces researchers with publications, blog posts, and professional background"
              }
            ].map((example, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => handleExampleSearch(example.query)}
                data-testid={`card-use-case-${idx}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-medium text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium mb-2">"{example.query}"</div>
                    <div className="text-gray-500 text-sm flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                      <span>{example.result}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-gray-600">
              <SiLinkedin className="w-5 h-5 text-[#0A66C2]" />
              <span className="text-sm font-medium">LinkedIn</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <SiGithub className="w-5 h-5 text-gray-900" />
              <span className="text-sm font-medium">GitHub</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Personal Sites</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Zap className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Conference Talks</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400">
            Based on aggregated search sessions across internet-scale professional data.
          </p>
        </div>
      </section>

      <section className="py-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Start finding candidates now
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Describe the person you need. Get ranked, explainable matches in minutes.
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
