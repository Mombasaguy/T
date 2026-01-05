import { useState, useEffect, useRef } from "react";
import {
  Search,
  Sparkles,
  Github,
  FileText,
  Twitter,
  ExternalLink,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  Mail,
  Copy,
  Check,
  X,
  History,
  Star,
  ChevronDown,
  MapPin,
  Filter,
  MessageSquare,
  Tag,
  Users,
  Square,
  CheckSquare,
  Link2,
  Globe,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import { 
  getOnboardingState, 
  setFirstSearchCompleted, 
  incrementSearchCount,
  PREFILLED_SEARCH_QUERY,
  trackEvent
} from "@/lib/onboarding";
import { SearchLoadingOverlay } from "@/components/onboarding/SearchLoadingOverlay";
import { FirstSavePrompt } from "@/components/onboarding/FirstSavePrompt";

interface SearchResult {
  id: string;
  name?: string;
  role?: string;
  title: string;
  subtitle?: string;
  url: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
  score?: number;
  matchStatus: "match" | "miss" | "unknown";
  platform: string;
}

const exampleQueries = [
  "Senior software engineers in San Francisco",
  "Product managers at fintech companies in NYC",
  "Director of engineering based in Austin",
  "Machine learning engineers in the Bay Area",
];

const benchmarkQueries = [
  "Senior software engineer in San Francisco",
  "Senior software engineer at startups",
  "Senior software engineer remote",
  "Senior software engineer in New York",
  "Senior backend engineer in Seattle",
  "Senior frontend engineer in Austin",
  "Full stack developer in Bay Area",
  "Full stack developer at fintech",
  "Product manager in San Francisco",
  "Product manager at startups",
  "Product manager in NYC",
  "Product manager at Series A companies",
  "Engineering manager in Seattle",
  "Engineering manager at FAANG",
  "Director of engineering in Austin",
  "Director of engineering at startups",
  "VP of Engineering in San Francisco",
  "CTO at startups",
  "Machine learning engineer in Bay Area",
  "Machine learning engineer at AI companies",
  "Data scientist in New York",
  "Data scientist at fintech",
  "DevOps engineer in Seattle",
  "DevOps engineer remote",
  "Platform engineer in San Francisco",
  "iOS developer in Los Angeles",
  "Android developer in Austin",
  "Mobile developer at startups",
  "React developer in NYC",
  "Python developer remote",
  "Go developer in Seattle",
  "Rust developer in San Francisco",
  "Security engineer at fintech",
  "Staff engineer in Bay Area",
  "Principal engineer at FAANG",
  "Tech lead in San Francisco",
  "Solutions architect remote",
  "Cloud engineer in Seattle",
  "SRE in San Francisco",
  "QA engineer at startups",
];

const querySuffixes: Record<string, string[]> = {
  "senior software engineer": ["in San Francisco", "in New York", "in Seattle", "in Austin", "at startups", "remote", "at FAANG", "at fintech"],
  "software engineer": ["in San Francisco", "in Bay Area", "at startups", "remote", "in NYC"],
  "product manager": ["in San Francisco", "in NYC", "at startups", "at Series A companies", "at fintech"],
  "engineering manager": ["in Seattle", "at FAANG", "at startups", "in San Francisco"],
  "machine learning": ["engineer in Bay Area", "engineer at AI companies", "scientist in NYC"],
  "data scientist": ["in New York", "at fintech", "remote", "in San Francisco"],
  "devops": ["engineer in Seattle", "engineer remote", "engineer at startups"],
  "frontend": ["developer in Austin", "engineer in NYC", "developer at startups"],
  "backend": ["engineer in Seattle", "developer in San Francisco", "engineer remote"],
  "full stack": ["developer in Bay Area", "developer at fintech", "engineer at startups"],
};

function getPlatformIcon(platform: string) {
  switch (platform) {
    case "GitHub":
      return <Github className="h-4 w-4" />;
    case "Twitter":
      return <Twitter className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function getPlatformColor(platform: string) {
  switch (platform) {
    case "GitHub":
      return "bg-gray-800 text-white";
    case "Twitter":
      return "bg-blue-500 text-white";
    case "LinkedIn":
      return "bg-blue-700 text-white";
    case "Medium":
      return "bg-green-600 text-white";
    case "Dev.to":
      return "bg-violet-600 text-white";
    case "YouTube":
      return "bg-red-600 text-white";
    case "Reddit":
      return "bg-orange-600 text-white";
    default:
      return "bg-gray-200 text-gray-700";
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function SkeletonCard() {
  return (
    <Card className="p-3 bg-white border-gray-200 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-gray-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </Card>
  );
}

interface SubscriptionInfo {
  plan: string;
  searchesUsed: number;
  searchesLimit: number;
  status: string;
}

export default function CandidateSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [filters, setFilters] = useState({
    platform: "all",
    matchStatus: "all",
    minScore: 0,
    dateRange: "all",
    location: "all",
  });
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [candidateMetadata, setCandidateMetadata] = useState<Record<string, { notes: string; tags: string[]; rating: number }>>({});
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<SearchResult[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<"description" | "url">("description");
  const [sourceProfile, setSourceProfile] = useState<{ name: string; title: string; url: string } | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    plan: 'free',
    searchesUsed: 0,
    searchesLimit: 10,
    status: 'active'
  });
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [localSearchCount, setLocalSearchCount] = useState(0);

  const statusTags = ["Contacted", "Interview", "Rejected", "Follow-up"];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCompareCandidate = (candidate: SearchResult) => {
    const isSelected = compareList.some((c) => c.url === candidate.url);
    if (isSelected) {
      setCompareList(compareList.filter((c) => c.url !== candidate.url));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, candidate]);
    }
  };

  const extractSkills = (candidate: SearchResult): string[] => {
    const text = `${candidate.title || ""} ${candidate.text || ""} ${candidate.role || ""}`.toLowerCase();
    const skillPatterns = [
      "python", "javascript", "typescript", "react", "node", "go", "rust", "java", "c++",
      "aws", "gcp", "azure", "kubernetes", "docker", "terraform", "sql", "postgresql", "mongodb",
      "machine learning", "deep learning", "ai", "data science", "analytics",
      "product management", "agile", "scrum", "leadership", "strategy"
    ];
    return skillPatterns.filter((skill) => text.includes(skill)).slice(0, 6);
  };

  const extractExperienceLevel = (candidate: SearchResult): string => {
    const text = `${candidate.title || ""} ${candidate.text || ""} ${candidate.role || ""}`.toLowerCase();
    if (text.includes("vp") || text.includes("vice president") || text.includes("cto") || text.includes("ceo")) return "Executive";
    if (text.includes("director") || text.includes("head of")) return "Director";
    if (text.includes("principal") || text.includes("staff")) return "Staff/Principal";
    if (text.includes("senior") || text.includes("sr.")) return "Senior";
    if (text.includes("lead") || text.includes("manager")) return "Lead/Manager";
    if (text.includes("junior") || text.includes("jr.")) return "Junior";
    return "Mid-level";
  };

  const getAutocompleteSuggestions = (input: string): string[] => {
    if (!input.trim() || input.length < 2) return [];
    const lowerInput = input.toLowerCase();
    const suggestions: string[] = [];
    
    benchmarkQueries.forEach((q) => {
      if (q.toLowerCase().includes(lowerInput) && q.toLowerCase() !== lowerInput) {
        suggestions.push(q);
      }
    });
    
    Object.entries(querySuffixes).forEach(([prefix, suffixes]) => {
      if (lowerInput.includes(prefix)) {
        suffixes.forEach((suffix) => {
          const suggestion = `${input.trim()} ${suffix}`;
          if (!suggestions.includes(suggestion)) {
            suggestions.push(suggestion);
          }
        });
      }
    });
    
    return suggestions.slice(0, 6);
  };

  useEffect(() => {
    const storedRecent = localStorage.getItem("recentSearches");
    const storedSaved = localStorage.getItem("savedSearches");
    const storedMetadata = localStorage.getItem("candidateMetadata");
    if (storedRecent) setRecentSearches(JSON.parse(storedRecent));
    if (storedSaved) setSavedSearches(JSON.parse(storedSaved));
    if (storedMetadata) setCandidateMetadata(JSON.parse(storedMetadata));
    
    // Fetch subscription info
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();
        if (data) {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      }
    };
    fetchSubscription();
    
    // Check for onboarding mode
    const urlParams = new URLSearchParams(window.location.search);
    const onboardingParam = urlParams.get('onboarding');
    const urlQuery = urlParams.get('query');
    const state = getOnboardingState();
    
    setLocalSearchCount(state.searchCount);
    
    if (onboardingParam === '1' && !state.firstSearchCompleted) {
      setIsOnboarding(true);
      setQuery(PREFILLED_SEARCH_QUERY);
    } else if (urlQuery) {
      setQuery(urlQuery);
      setTimeout(() => {
        handleSearch(urlQuery);
      }, 100);
    }
  }, []);

  const getCandidateKey = (candidate: SearchResult) => candidate.url || candidate.id;

  const getCandidateData = (candidate: SearchResult) => {
    const key = getCandidateKey(candidate);
    return candidateMetadata[key] || { notes: "", tags: [], rating: 0 };
  };

  const updateCandidateData = (candidate: SearchResult, data: Partial<{ notes: string; tags: string[]; rating: number }>) => {
    const key = getCandidateKey(candidate);
    const current = getCandidateData(candidate);
    const updated = { ...candidateMetadata, [key]: { ...current, ...data } };
    setCandidateMetadata(updated);
    localStorage.setItem("candidateMetadata", JSON.stringify(updated));
  };

  const toggleTag = (candidate: SearchResult, tag: string) => {
    const current = getCandidateData(candidate);
    const newTags = current.tags.includes(tag)
      ? current.tags.filter((t) => t !== tag)
      : [...current.tags, tag];
    updateCandidateData(candidate, { tags: newTags });
  };

  const addToRecentSearches = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const toggleSavedSearch = (searchQuery: string) => {
    let updated: string[];
    if (savedSearches.includes(searchQuery)) {
      updated = savedSearches.filter((s) => s !== searchQuery);
    } else {
      updated = [searchQuery, ...savedSearches];
    }
    setSavedSearches(updated);
    localStorage.setItem("savedSearches", JSON.stringify(updated));
  };

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setSearchPerformed(true);
    setSelectedCandidate(null);
    setShowSearchDropdown(false);
    setSourceProfile(null);
    
    if (searchMode === "description") {
      addToRecentSearches(q);
    }

    try {
      const endpoint = searchMode === "url" ? "/api/find-similar" : "/api/search";
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, mode: searchMode })
      });
      const data = await response.json();
      
      if (response.status === 403) {
        alert(data.message || 'Search limit reached. Upgrade to continue searching.');
        window.location.href = '/pricing';
        return;
      }
      
      if (!response.ok) {
        console.error('Search API error:', data);
        alert(data.error || 'Search failed. Please try again.');
        setResults([]);
        return;
      }
      
      const searchResults = data.results || [];
      setResults(searchResults);

      // Update subscription usage
      if (data.usage) {
        setSubscription(prev => ({ ...prev, ...data.usage }));
      }
      
      // Clear onboarding state after first search
      if (isOnboarding) {
        setIsOnboarding(false);
        setFirstSearchCompleted();
      }
      
      // Track search count for usage nudges
      const newCount = incrementSearchCount();
      setLocalSearchCount(newCount);
      trackEvent('search_completed', { query: q, resultCount: searchResults.length });

      if (searchMode === "url" && data.sourceProfile) {
        setSourceProfile(data.sourceProfile);
      }

      const platforms: Record<string, number> = {};
      let matchCount = 0;
      searchResults.forEach((r: SearchResult) => {
        platforms[r.platform] = (platforms[r.platform] || 0) + 1;
        if (r.matchStatus === "match") matchCount++;
      });

      const stat = {
        query: searchMode === "url" ? `[URL] ${q}` : q,
        timestamp: Date.now(),
        resultCount: searchResults.length,
        matchCount,
        platforms,
      };
      const existingStats = JSON.parse(localStorage.getItem("searchStats") || "[]");
      localStorage.setItem("searchStats", JSON.stringify([...existingStats, stat]));
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const exportToCSV = async () => {
    if (results.length === 0) return;

    const headers = ["Name", "Role", "Platform", "URL", "Match Status", "Score"];
    const rows = results.map((r) => [
      r.name || r.author || "Unknown",
      r.role || r.subtitle || "",
      r.platform,
      r.url,
      r.matchStatus,
      r.score !== undefined && r.score !== null ? Math.round(r.score * 100).toString() : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
    const filename = `candidates-${timestamp}.csv`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: "text/csv" });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "Candidate Export",
          });
          return;
        } catch (err) {
          console.log("Share cancelled or failed, trying fallback");
        }
      }
    }
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const generateEmail = async () => {
    if (!selectedCandidate) return;
    
    setGeneratingEmail(true);
    setCopied(false);
    
    try {
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate: selectedCandidate }),
      });
      const data = await response.json();
      
      if (response.status === 403) {
        // User needs to upgrade
        if (confirm("AI email generation requires a Professional plan or higher. Would you like to upgrade?")) {
          window.location.href = "/pricing";
        }
        return;
      }
      
      if (!response.ok) {
        alert(data.error || "Failed to generate email. Please try again.");
        return;
      }
      
      setEmailDraft(data.email);
      setShowEmailModal(true);
    } catch (error) {
      console.error("Failed to generate email:", error);
      alert("Failed to generate email. Please try again.");
    } finally {
      setGeneratingEmail(false);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(emailDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <SearchLoadingOverlay isVisible={loading && isOnboarding} />
      
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors" data-testid="link-home">
            TalentPilot
          </a>
          <a href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors" data-testid="link-pricing">
            Pricing
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div ref={searchContainerRef} className="max-w-xl mx-auto">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setAutocompleteSuggestions(getAutocompleteSuggestions(e.target.value));
              }}
              onKeyDown={handleKeyDown}
              placeholder="Describe the person you need..."
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none"
              data-testid="input-search"
            />
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="mt-3 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-search"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "Find Candidates Now"
              )}
            </button>
          </div>

          {/* Example Prompts */}
          {!searchPerformed && (
            <div className="mt-2 border-t border-gray-100 pt-1 space-y-1">
                <button
                  onClick={() => {
                    setQuery("Healthcare operations leaders who've led EHR rollouts");
                    handleSearch("Healthcare operations leaders who've led EHR rollouts");
                  }}
                  className="w-full text-left"
                  data-testid="button-example-healthcare"
                >
                  <div className="flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50/50 transition-colors">
                    <div className="mt-0.5 text-gray-400">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-normal text-gray-600 leading-snug">Healthcare operations leaders who've led EHR rollouts</div>
                      <div className="text-xs text-gray-400 mt-0.5">Hands-on delivery experience — not just titles.</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setQuery("Product managers at fintech companies who write about design systems");
                    handleSearch("Product managers at fintech companies who write about design systems");
                  }}
                  className="w-full text-left"
                  data-testid="button-example-fintech"
                >
                  <div className="flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50/50 transition-colors">
                    <div className="mt-0.5 text-gray-400">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-normal text-gray-600 leading-snug">Product managers at fintech companies who write about design systems</div>
                      <div className="text-xs text-gray-400 mt-0.5">Real writing, portfolio work, and relevant experience.</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setQuery("Senior engineers who've spoken at React conferences");
                    handleSearch("Senior engineers who've spoken at React conferences");
                  }}
                  className="w-full text-left"
                  data-testid="button-example-react"
                >
                  <div className="flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50/50 transition-colors">
                    <div className="mt-0.5 text-gray-400">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-normal text-gray-600 leading-snug">Senior engineers who've spoken at React conferences</div>
                      <div className="text-xs text-gray-400 mt-0.5">Visible in talks, code, and professional profiles.</div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

        {searchPerformed && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {loading ? "Searching..." : `${results.length} Results`}
                </h2>
                {results.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 flex items-center gap-2"
                        data-testid="button-export-csv"
                      >
                        <Download className="w-4 h-4" />
                        Export CSV
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Download your candidate list as a CSV file.</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              {results.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-2 mb-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center justify-between w-full md:hidden px-2 py-1"
                    data-testid="button-toggle-filters"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">Filters</span>
                      {(filters.platform !== "all" || filters.matchStatus !== "all" || filters.dateRange !== "all" || filters.location !== "all" || filters.minScore > 0) && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Active</span>
                      )}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-wrap items-center gap-2`}>
                    <select
                      value={filters.platform}
                      onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                      className="px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-700"
                      data-testid="select-platform"
                    >
                      <option value="all">All Platforms</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Blog">Personal Sites</option>
                    </select>

                    <select
                      value={filters.matchStatus}
                      onChange={(e) => setFilters({ ...filters, matchStatus: e.target.value })}
                      className="px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-700"
                      data-testid="select-match-status"
                    >
                      <option value="all">All Matches</option>
                      <option value="match">Match Only</option>
                      <option value="miss">Miss Only</option>
                    </select>

                    <select
                      value={filters.dateRange}
                      onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                      className="px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-700"
                      data-testid="select-date-range"
                    >
                      <option value="all">Any Date</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="year">Last Year</option>
                    </select>

                    <select
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      className="px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-700"
                      data-testid="select-location"
                    >
                      <option value="all">All Locations</option>
                      {(() => {
                        const locations = new Set<string>();
                        const knownLocations = ["San Francisco", "New York", "Los Angeles", "Seattle", "Austin", "Boston", "Chicago", "Denver", "Atlanta", "Miami", "London", "Berlin", "Toronto", "Singapore", "Remote", "Bay Area", "NYC", "SF"];
                        results.forEach((r) => {
                          const text = `${r.title || ""} ${r.text || ""} ${r.role || ""}`;
                          knownLocations.forEach((loc) => {
                            if (text.toLowerCase().includes(loc.toLowerCase())) {
                              locations.add(loc);
                            }
                          });
                        });
                        return Array.from(locations).slice(0, 10).map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ));
                      })()}
                    </select>

                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded px-2 py-1">
                      <label className="text-xs text-gray-600 whitespace-nowrap">Score:</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.minScore}
                        onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
                        className="w-16 accent-blue-500"
                        data-testid="slider-min-score"
                      />
                      <span className="text-xs text-gray-700 w-8">{filters.minScore}%</span>
                    </div>

                    {(filters.platform !== "all" || filters.matchStatus !== "all" || filters.dateRange !== "all" || filters.location !== "all" || filters.minScore > 0) && (
                      <button
                        onClick={() => setFilters({ platform: "all", matchStatus: "all", minScore: 0, dateRange: "all", location: "all" })}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        data-testid="button-clear-filters"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}

              {searchMode === "url" && sourceProfile && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Finding candidates similar to:</p>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {sourceProfile.name}
                      </h3>
                      <p className="text-sm text-gray-600">{sourceProfile.title}</p>
                    </div>
                  </div>
                </div>
              )}

              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-2 pr-4">
                  {loading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
                      <p className="text-gray-700 font-medium">Searching public professional profiles...</p>
                      <p className="text-sm text-gray-500 mt-1">Looking at experience, work, and relevant professional signals.</p>
                    </div>
                  ) : (() => {
                    const filteredResults = results.filter((r) => {
                      if (filters.platform !== "all" && r.platform !== filters.platform) return false;
                      if (filters.matchStatus !== "all" && r.matchStatus !== filters.matchStatus) return false;
                      const score = r.score !== undefined && r.score !== null ? Math.round(r.score * 100) : 0;
                      if (score < filters.minScore) return false;
                      
                      if (filters.dateRange !== "all" && r.publishedDate) {
                        const date = new Date(r.publishedDate);
                        const now = new Date();
                        const diffMs = now.getTime() - date.getTime();
                        const diffDays = diffMs / (1000 * 60 * 60 * 24);
                        if (filters.dateRange === "week" && diffDays > 7) return false;
                        if (filters.dateRange === "month" && diffDays > 30) return false;
                        if (filters.dateRange === "year" && diffDays > 365) return false;
                      }
                      
                      if (filters.location !== "all") {
                        const text = `${r.title || ""} ${r.text || ""} ${r.role || ""}`.toLowerCase();
                        if (!text.includes(filters.location.toLowerCase())) return false;
                      }
                      
                      return true;
                    });
                    
                    if (filteredResults.length === 0) {
                      return (
                        <div className="text-center py-12 text-gray-500">
                          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="font-medium text-gray-700">No results found</p>
                          <p className="text-sm mt-1">Try broadening your description or focusing on experience rather than titles.</p>
                        </div>
                      );
                    }
                    
                    return filteredResults.map((result, index) => (
                      <Card
                        key={result.id + index}
                        onClick={() => setSelectedCandidate(result)}
                        className={`p-3 cursor-pointer transition-all duration-200 ${
                          selectedCandidate?.id === result.id
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                        data-testid={`card-result-${index}`}
                      >
                        <div className="flex items-center gap-2 group">
                          <div className={`p-1.5 rounded ${getPlatformColor(result.platform)}`}>
                            {getPlatformIcon(result.platform)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {result.name || result.author || "Unknown"}
                              </h3>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {result.score !== undefined && result.score !== null && result.score > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-xs text-gray-500 cursor-help">
                                        {Math.round(result.score * 100)}%
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Reflects how well this profile aligns with your search description.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                {result.matchStatus === "match" ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs px-1.5 py-0 cursor-help">
                                        Match
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Matches based on role, experience, and demonstrated work.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : result.matchStatus === "miss" ? (
                                  <Badge className="bg-red-500/20 text-red-600 border-red-500/30 text-xs px-1.5 py-0">
                                    Miss
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {result.role || result.subtitle || result.title}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ));
                  })()}
                </div>
              </ScrollArea>
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-6">
                <Card className="bg-white border-gray-200 overflow-hidden">
                  {selectedCandidate ? (
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-lg ${getPlatformColor(selectedCandidate.platform)}`}>
                          {getPlatformIcon(selectedCandidate.platform)}
                        </div>
                        <div>
                          <Badge className={getPlatformColor(selectedCandidate.platform)}>
                            {selectedCandidate.platform}
                          </Badge>
                          {formatDate(selectedCandidate.publishedDate) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(selectedCandidate.publishedDate)}
                            </p>
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {selectedCandidate.name || selectedCandidate.author || selectedCandidate.title}
                      </h3>
                      {selectedCandidate.subtitle && (
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                          {selectedCandidate.subtitle}
                        </p>
                      )}

                      {selectedCandidate.text && (
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Preview
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {selectedCandidate.text.slice(0, 300)}
                            {selectedCandidate.text.length > 300 && "..."}
                          </p>
                        </div>
                      )}

                      {selectedCandidate.highlights && selectedCandidate.highlights.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Key Highlights
                          </h4>
                          <ul className="space-y-2">
                            {selectedCandidate.highlights.slice(0, 3).map((highlight, i) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rating</span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => updateCandidateData(selectedCandidate, { rating: getCandidateData(selectedCandidate).rating === star ? 0 : star })}
                              className="p-1 transition-colors"
                              data-testid={`button-rating-${star}`}
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= getCandidateData(selectedCandidate).rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide cursor-help">Status</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Track where this candidate is in your hiring process.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {statusTags.map((tag) => {
                            const isActive = getCandidateData(selectedCandidate).tags.includes(tag);
                            const tagColors: Record<string, string> = {
                              Contacted: isActive ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-500 border-gray-200",
                              Interview: isActive ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-gray-100 text-gray-500 border-gray-200",
                              Rejected: isActive ? "bg-red-100 text-red-700 border-red-200" : "bg-gray-100 text-gray-500 border-gray-200",
                              "Follow-up": isActive ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-gray-100 text-gray-500 border-gray-200",
                            };
                            return (
                              <button
                                key={tag}
                                onClick={() => toggleTag(selectedCandidate, tag)}
                                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${tagColors[tag]}`}
                                data-testid={`button-tag-${tag.toLowerCase()}`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</span>
                        </div>
                        <Textarea
                          placeholder="Add notes about this candidate..."
                          value={getCandidateData(selectedCandidate).notes}
                          onChange={(e) => updateCandidateData(selectedCandidate, { notes: e.target.value })}
                          className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm resize-none"
                          rows={3}
                          data-testid="textarea-notes"
                        />
                      </div>

                      <button
                        onClick={generateEmail}
                        disabled={generatingEmail}
                        className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 mb-3"
                        data-testid="button-draft-email"
                      >
                        {generatingEmail ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                        {generatingEmail ? "Generating..." : "Draft Outreach Email"}
                      </button>

                      <Button
                        asChild
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <a
                          href={selectedCandidate.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid="link-view-source"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Full Source
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">
                        Select a candidate to view their professional footprint.
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end lg:hidden">
          <div className="bg-white w-full max-h-[85vh] overflow-y-auto rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Candidate Details</h3>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                data-testid="button-close-candidate-mobile"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${getPlatformColor(selectedCandidate.platform)}`}>
                  {getPlatformIcon(selectedCandidate.platform)}
                </div>
                <div>
                  <Badge className={getPlatformColor(selectedCandidate.platform)}>
                    {selectedCandidate.platform}
                  </Badge>
                  {formatDate(selectedCandidate.publishedDate) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(selectedCandidate.publishedDate)}
                    </p>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedCandidate.name || selectedCandidate.author || selectedCandidate.title}
              </h3>
              {selectedCandidate.subtitle && (
                <p className="text-sm text-gray-500 mb-4">
                  {selectedCandidate.subtitle}
                </p>
              )}

              {selectedCandidate.text && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Preview
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedCandidate.text.slice(0, 400)}
                    {selectedCandidate.text.length > 400 && "..."}
                  </p>
                </div>
              )}

              {selectedCandidate.highlights && selectedCandidate.highlights.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Key Highlights
                  </h4>
                  <ul className="space-y-2">
                    {selectedCandidate.highlights.slice(0, 3).map((highlight, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rating</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => updateCandidateData(selectedCandidate, { rating: getCandidateData(selectedCandidate).rating === star ? 0 : star })}
                      className="p-1 transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= getCandidateData(selectedCandidate).rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusTags.map((tag) => {
                    const isActive = getCandidateData(selectedCandidate).tags.includes(tag);
                    const tagColors: Record<string, string> = {
                      Contacted: isActive ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-500 border-gray-200",
                      Interview: isActive ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-gray-100 text-gray-500 border-gray-200",
                      Rejected: isActive ? "bg-red-100 text-red-700 border-red-200" : "bg-gray-100 text-gray-500 border-gray-200",
                      "Follow-up": isActive ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-gray-100 text-gray-500 border-gray-200",
                    };
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(selectedCandidate, tag)}
                        className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors ${tagColors[tag]}`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={generateEmail}
                  disabled={generatingEmail}
                  className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {generatingEmail ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  {generatingEmail ? "Generating..." : "Draft Outreach Email"}
                </button>

                <a
                  href={selectedCandidate.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Full Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Draft Outreach Email</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                data-testid="button-close-modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {emailDraft}
              </pre>
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={copyEmail}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                data-testid="button-copy-email"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </>
                )}
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                data-testid="button-close-email"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompareModal && compareList.length >= 2 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Compare Candidates</h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                data-testid="button-close-compare"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className={`grid gap-4 ${compareList.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {compareList.map((candidate, index) => (
                  <div key={candidate.url} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                      <div className={`p-2 rounded-lg ${getPlatformColor(candidate.platform)}`}>
                        {getPlatformIcon(candidate.platform)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {candidate.name || candidate.author || "Unknown"}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {candidate.role || candidate.subtitle || candidate.platform}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <TrendingUp className="w-3 h-3" />
                          Match Score
                        </h5>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${Math.round((candidate.score || 0) * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {Math.round((candidate.score || 0) * 100)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Experience Level
                        </h5>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          {extractExperienceLevel(candidate)}
                        </Badge>
                      </div>

                      <div>
                        <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Skills Detected
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {extractSkills(candidate).length > 0 ? (
                            extractSkills(candidate).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs border-gray-300 text-gray-700">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">No skills detected</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          Recent Activity
                        </h5>
                        <span className="text-sm text-gray-700">
                          {candidate.publishedDate
                            ? new Date(candidate.publishedDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Unknown"}
                        </span>
                      </div>

                      <div>
                        <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Match Status
                        </h5>
                        {candidate.matchStatus === "match" ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Match
                          </Badge>
                        ) : candidate.matchStatus === "miss" ? (
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            Miss
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 border-gray-200">
                            Unknown
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <a
                        href={candidate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        data-testid={`link-compare-source-${index}`}
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Profile
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setCompareList([]);
                  setShowCompareModal(false);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                data-testid="button-clear-compare"
              >
                Clear Selection
              </button>
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                data-testid="button-done-compare"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCandidate && (
        <FirstSavePrompt
          onSave={() => {
            updateCandidateData(selectedCandidate, { 
              tags: [...getCandidateData(selectedCandidate).tags, "Saved"]
            });
          }}
        />
      )}

      {isOnboarding && !searchPerformed && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-40">
          <Button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            data-testid="button-search-mobile"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Search Candidates
          </Button>
        </div>
      )}
    </div>
  );
}
