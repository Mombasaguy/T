import { useState } from 'react';
import { useLocation } from 'wouter';
import { Search, Sparkles, Globe, Mail, Zap, Target, Brain, Clock, X, Check } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">Candidate Command Center</span>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          <button 
            onClick={() => setLocation('/search')}
            className="text-gray-300 hover:text-white transition-colors"
            data-testid="link-search"
          >
            Search
          </button>
          <button 
            onClick={() => setLocation('/pricing')}
            className="text-gray-300 hover:text-white transition-colors"
            data-testid="link-pricing"
          >
            Pricing
          </button>
          <button 
            onClick={() => setLocation('/search')}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            data-testid="button-get-started"
          >
            Get Started
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-12 pb-32">
        <div className="text-center max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Candidate Command Center</h1>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            The Most Powerful Semantic Search
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              for Recruiting
            </span>
          </h2>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Search 1+ billion profiles across LinkedIn, GitHub, personal sites, and the entire web using 
            natural language. Powered by advanced semantic AI. Find candidates others miss.
          </p>

          <div className="flex items-center justify-center gap-4 mb-12 flex-wrap">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <SiLinkedin className="w-6 h-6 text-blue-400" />
              <span className="text-white font-medium">LinkedIn</span>
            </div>
            <span className="text-white text-2xl">+</span>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <SiGithub className="w-6 h-6 text-purple-400" />
              <span className="text-white font-medium">GitHub</span>
            </div>
            <span className="text-white text-2xl">+</span>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <Globe className="w-6 h-6 text-green-400" />
              <span className="text-white font-medium">Web</span>
            </div>
            <span className="text-white text-3xl hidden sm:inline">→</span>
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 rounded-full">
              <Mail className="w-6 h-6 text-white" />
              <span className="text-white font-medium">AI Outreach</span>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Senior React developers in Austin who contribute to open source"
                className="w-full pl-16 pr-6 py-5 rounded-2xl text-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                data-testid="input-hero-search"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="mt-4 px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center gap-3 mx-auto"
              data-testid="button-hero-search"
            >
              <Sparkles className="w-5 h-5" />
              Search Now
            </button>
          </div>

          <div className="text-left max-w-2xl mx-auto">
            <p className="text-gray-400 text-sm mb-3">Try these searches:</p>
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
                  className="text-left px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-sm transition-all duration-200"
                  data-testid={`button-example-search-${idx}`}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border-y border-white/10 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1" data-testid="stat-profiles">1B+</div>
              <div className="text-gray-400 text-sm">Profiles Indexed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1" data-testid="stat-roles">All Roles</div>
              <div className="text-gray-400 text-sm">Not Just Tech</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1" data-testid="stat-match">92%</div>
              <div className="text-gray-400 text-sm">Match Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1" data-testid="stat-savings">95%</div>
              <div className="text-gray-400 text-sm">Time Savings</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-white mb-4">
            Why Candidate Command Center?
          </h3>
          <p className="text-xl text-gray-400">
            The only recruiting tool that searches 1 billion+ profiles across the entire internet
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Semantic Search</h4>
            <p className="text-gray-400 leading-relaxed">
              Natural language queries powered by advanced AI. Understands context and intent, not just keywords.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Multi-Platform Search</h4>
            <p className="text-gray-400 leading-relaxed">
              LinkedIn, GitHub, personal sites, portfolios, blogs, and more—all in one search.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Intelligent Matching</h4>
            <p className="text-gray-400 leading-relaxed">
              Finds candidates based on their actual work, contributions, and online presence.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">AI Outreach</h4>
            <p className="text-gray-400 leading-relaxed">
              Personalized emails generated automatically for each candidate based on their profile.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Entire Web Access</h4>
            <p className="text-gray-400 leading-relaxed">
              Search beyond LinkedIn to the full internet. Find hidden talent others miss.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Instant Results</h4>
            <p className="text-gray-400 leading-relaxed">
              Find qualified candidates in seconds, not hours. Cut sourcing time by 95%.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border-y border-white/10 py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-4xl font-bold text-white text-center mb-4">
              More Powerful Than Traditional Tools
            </h3>
            <p className="text-xl text-gray-400 text-center mb-16">
              LinkedIn Recruiter searches 900M profiles. We search the entire internet.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
                <div className="text-red-400 font-bold text-lg mb-6 flex items-center gap-2">
                  <X className="w-5 h-5" />
                  Traditional Recruiting
                </div>
                <div className="space-y-4 text-gray-300">
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">-</span>
                    <span>30 min searching LinkedIn manually</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">-</span>
                    <span>30 min checking GitHub profiles</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">-</span>
                    <span>30 min finding personal websites</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">-</span>
                    <span>30 min writing personalized emails</span>
                  </div>
                  <div className="pt-4 border-t border-red-500/20">
                    <div className="text-2xl font-bold text-red-400">2 hours per candidate</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8">
                <div className="text-green-400 font-bold text-lg mb-6 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Candidate Command Center
                </div>
                <div className="space-y-4 text-gray-300">
                  <div className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">+</span>
                    <span>One search across all platforms</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">+</span>
                    <span>Semantic AI finds best matches</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">+</span>
                    <span>Includes GitHub, blogs, portfolios</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">+</span>
                    <span>AI-generated personalized outreach</span>
                  </div>
                  <div className="pt-4 border-t border-green-500/20">
                    <div className="text-2xl font-bold text-green-400">2 minutes per candidate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-4xl font-bold text-white text-center mb-4">
            Find Candidates Others Miss
          </h3>
          <p className="text-xl text-gray-400 text-center mb-16">
            Searches that only work with Candidate Command Center
          </p>

          <div className="space-y-6">
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
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                onClick={() => handleExampleSearch(example.query)}
                data-testid={`card-use-case-${idx}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium mb-2 text-lg">"{example.query}"</div>
                    <div className="text-green-400 text-sm flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>{example.result}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-md border border-white/10 rounded-3xl p-12">
          <h3 className="text-4xl font-bold text-white mb-6">
            Experience The Most Powerful Recruiting Search
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Join recruiters searching 1+ billion profiles with semantic AI, not just LinkedIn
          </p>
          <button 
            onClick={() => setLocation('/search')}
            className="px-12 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 inline-flex items-center gap-3"
            data-testid="button-cta-search"
          >
            <Sparkles className="w-6 h-6" />
            Start Searching Now
          </button>
          <p className="text-gray-400 text-sm mt-6">
            Access 1+ billion profiles - Powered by advanced semantic AI
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>2024 Candidate Command Center. Search 1+ billion profiles across the entire web.</p>
          <p className="mt-2">Powered by advanced semantic AI technology.</p>
        </div>
      </div>
    </div>
  );
}
