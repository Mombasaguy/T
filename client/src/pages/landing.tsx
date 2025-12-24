import { useState } from 'react';
import { useLocation } from 'wouter';
import { Search, Sparkles, Globe, Mail, Zap, Target, Brain, Clock, CheckCircle } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900 font-semibold text-lg">Candidate Command Center</span>
          </div>
          <div className="flex items-center gap-8 flex-wrap">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</a>
            <button 
              onClick={() => setLocation('/pricing')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              data-testid="link-pricing"
            >
              Pricing
            </button>
            <button 
              onClick={() => setLocation('/search')}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              data-testid="button-get-started"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 pt-20 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Search 1+ Billion Profiles
            <br />
            <span className="text-blue-600">Across the Entire Internet</span>
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Access LinkedIn, GitHub, personal sites, and 1+ billion profiles updated with 50 million weekly refreshes. 
            Use natural language AI search to find candidates others miss.
          </p>

          <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
            <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full border border-gray-200 shadow-sm">
              <SiLinkedin className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700 font-medium text-sm">LinkedIn</span>
            </div>
            <span className="text-gray-400 text-xl">+</span>
            <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full border border-gray-200 shadow-sm">
              <SiGithub className="w-5 h-5 text-gray-900" />
              <span className="text-gray-700 font-medium text-sm">GitHub</span>
            </div>
            <span className="text-gray-400 text-xl">+</span>
            <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full border border-gray-200 shadow-sm">
              <Globe className="w-5 h-5 text-green-600" />
              <span className="text-gray-700 font-medium text-sm">Web</span>
            </div>
            <span className="text-gray-400 text-2xl hidden sm:inline">→</span>
            <div className="flex items-center gap-2 bg-blue-600 px-5 py-3 rounded-full shadow-sm">
              <Mail className="w-5 h-5 text-white" />
              <span className="text-white font-medium text-sm">AI Outreach</span>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="flex items-center px-6 py-4">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Senior React developers in Austin who contribute to open source"
                  className="flex-1 text-base text-gray-900 placeholder-gray-400 focus:outline-none"
                  data-testid="input-hero-search"
                />
              </div>
            </div>
            <button 
              onClick={handleSearch}
              className="mt-5 px-10 py-3.5 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
              data-testid="button-hero-search"
            >
              Search Now
            </button>
          </div>

          <div className="text-left max-w-xl mx-auto">
            <p className="text-gray-500 text-sm mb-3 font-medium">Try these searches:</p>
            <div className="flex flex-col gap-2">
              {[
                "Senior software engineers in San Francisco who blog about AI",
                "Product managers at fintech companies in NYC with GitHub activity",
                "Marketing directors who speak at conferences and write about growth",
                "Sales leaders at enterprise SaaS companies in Austin"
              ].map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleSearch(search)}
                  className="text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 border-l-4 border-l-blue-500 rounded-lg text-gray-700 text-sm transition-colors"
                  data-testid={`button-example-search-${idx}`}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-y border-gray-200 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2" data-testid="stat-profiles">1B+</div>
              <div className="text-gray-600 text-sm font-medium">Profiles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2" data-testid="stat-updates">50M</div>
              <div className="text-gray-600 text-sm font-medium">Weekly Updates</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2" data-testid="stat-match">92%</div>
              <div className="text-gray-600 text-sm font-medium">Match Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2" data-testid="stat-time">2 min</div>
              <div className="text-gray-600 text-sm font-medium">Per Search</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-24" id="features">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Candidate Command Center?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The only recruiting tool that searches 1 billion+ profiles across the entire internet
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Search</h3>
            <p className="text-gray-600 leading-relaxed">
              Natural language queries that understand what you're looking for, not just keyword matching.
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-8 border border-green-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Always Fresh Data</h3>
            <p className="text-gray-600 leading-relaxed">
              50 million profile updates every week. Never miss a job change, new skill, or career move.
            </p>
          </div>

          <div className="bg-purple-50 rounded-2xl p-8 border border-purple-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Platform Search</h3>
            <p className="text-gray-600 leading-relaxed">
              LinkedIn, GitHub, personal sites, portfolios, blogs, and more—all in one search.
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-8 border border-green-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Intelligent Matching</h3>
            <p className="text-gray-600 leading-relaxed">
              Finds candidates based on their actual work, contributions, and online presence.
            </p>
          </div>

          <div className="bg-orange-50 rounded-2xl p-8 border border-orange-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
              <Mail className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Outreach</h3>
            <p className="text-gray-600 leading-relaxed">
              Personalized emails generated automatically for each candidate based on their profile.
            </p>
          </div>

          <div className="bg-pink-50 rounded-2xl p-8 border border-pink-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Results</h3>
            <p className="text-gray-600 leading-relaxed">
              Find qualified candidates in 2 minutes instead of 2 hours. Cut sourcing time by 95%.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
              More Powerful Than Traditional Tools
            </h2>
            <p className="text-lg text-gray-600 text-center mb-16">
              LinkedIn Recruiter searches 900M profiles. We search the entire internet.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 border-2 border-red-300">
                <div className="text-red-600 font-bold text-lg mb-6 flex items-center gap-3">
                  <span className="text-2xl">X</span>
                  <span>Traditional Recruiting</span>
                </div>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 mt-0.5">&bull;</span>
                    <span>30 min searching LinkedIn manually</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 mt-0.5">&bull;</span>
                    <span>30 min checking GitHub profiles</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 mt-0.5">&bull;</span>
                    <span>30 min finding personal websites</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 mt-0.5">&bull;</span>
                    <span>30 min writing personalized emails</span>
                  </div>
                  <div className="pt-4 mt-4">
                    <div className="text-2xl font-bold text-red-600">2 hours per candidate</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 border-2 border-green-300">
                <div className="text-green-600 font-bold text-lg mb-6 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6" />
                  <span>Candidate Command Center</span>
                </div>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">&bull;</span>
                    <span>One search across all platforms</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">&bull;</span>
                    <span>Semantic AI finds best matches</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">&bull;</span>
                    <span>Includes GitHub, blogs, portfolios</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">&bull;</span>
                    <span>AI-generated personalized outreach</span>
                  </div>
                  <div className="pt-4 mt-4">
                    <div className="text-2xl font-bold text-green-600">2 minutes per candidate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Find Candidates Others Miss
          </h2>
          <p className="text-lg text-gray-600 text-center mb-16">
            Searches that only work with Candidate Command Center
          </p>

          <div className="space-y-4">
            {[
              {
                query: "Find React developers who wrote blog posts about Next.js 14 in the last 6 months",
                result: "Shows developers from dev.to, Medium, personal blogs, with links to their technical writing"
              },
              {
                query: "Find marketing directors who speak at conferences and have written about growth strategies",
                result: "Finds speakers with conference videos, blog posts, and their professional marketing background"
              },
              {
                query: "Find sales leaders at enterprise SaaS companies who post regularly on LinkedIn",
                result: "Shows sales executives with their content, LinkedIn activity, and career progression"
              },
              {
                query: "Find product managers who contributed to open source projects and write about design",
                result: "Identifies PMs with GitHub contributions, design blogs, and professional profiles"
              }
            ].map((example, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-6 border border-gray-200 border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleExampleSearch(example.query)}
                data-testid={`card-use-case-${idx}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold text-lg">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium mb-2 text-base">"{example.query}"</div>
                    <div className="text-green-600 text-sm flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{example.result}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center bg-blue-600 rounded-3xl p-12 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Find Better Candidates Faster?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join recruiters accessing 1+ billion profiles with 50 million weekly updates
          </p>
          <button 
            onClick={() => setLocation('/search')}
            className="px-12 py-4 bg-white text-blue-600 text-lg font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg inline-flex items-center gap-3"
            data-testid="button-cta-search"
          >
            <Sparkles className="w-6 h-6" />
            Start Searching Now
          </button>
          <p className="text-blue-200 text-sm mt-6">
            1+ billion profiles - 50M weekly updates - AI-powered search
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 py-8 bg-white">
        <div className="container mx-auto px-6 text-center text-gray-600 text-sm">
          <p>2024 Candidate Command Center. Search 1+ billion profiles across the entire web.</p>
          <p className="mt-2">Powered by advanced semantic AI technology.</p>
        </div>
      </div>
    </div>
  );
}
