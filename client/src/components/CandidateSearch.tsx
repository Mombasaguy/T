import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";

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
      return "bg-slate-600 text-white";
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
    <Card className="p-4 bg-slate-800/50 border-slate-700 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-700 rounded w-1/2" />
          <div className="h-3 bg-slate-700 rounded w-full" />
        </div>
      </div>
    </Card>
  );
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

  const statusTags = ["Contacted", "Interview", "Rejected", "Follow-up"];

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
    addToRecentSearches(q);

    try {
      const response = await apiRequest("POST", "/api/search", { query: q });
      const data = await response.json();
      setResults(data.results || []);
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

  const exportToCSV = () => {
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

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
    link.href = url;
    link.download = `candidates-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateEmail = async () => {
    if (!selectedCandidate) return;
    
    setGeneratingEmail(true);
    setCopied(false);
    
    try {
      const response = await apiRequest("POST", "/api/generate-email", {
        candidate: selectedCandidate,
      });
      const data = await response.json();
      setEmailDraft(data.email);
      setShowEmailModal(true);
    } catch (error) {
      console.error("Failed to generate email:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="text-center mb-12 animate-fadeIn">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Candidate Command Center
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            AI-powered search to discover exceptional talent across the web
          </p>
        </header>

        <div className="max-w-2xl mx-auto mb-8 animate-fadeInUp">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition duration-300" />
            <div className="relative flex gap-2 bg-slate-900 rounded-xl p-2 border border-slate-700">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search for candidates..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setAutocompleteSuggestions(getAutocompleteSuggestions(e.target.value));
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="pl-10 bg-transparent border-0 text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  data-testid="input-search"
                />
              </div>
              <button
                onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                className="px-2 text-slate-400 hover:text-slate-300"
                data-testid="button-toggle-history"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showSearchDropdown ? "rotate-180" : ""}`} />
              </button>
              <Button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6"
                data-testid="button-search"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {showSearchDropdown && (autocompleteSuggestions.length > 0 || savedSearches.length > 0 || recentSearches.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                {autocompleteSuggestions.length > 0 && (
                  <div className="p-3 border-b border-slate-700">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                      <Sparkles className="w-3 h-3" />
                      Suggestions
                    </div>
                    <div className="space-y-1">
                      {autocompleteSuggestions.map((suggestion, index) => (
                        <button
                          key={`suggestion-${index}`}
                          onClick={() => {
                            setQuery(suggestion);
                            setAutocompleteSuggestions([]);
                            handleSearch(suggestion);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                          data-testid={`button-suggestion-${index}`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {savedSearches.length > 0 && (
                  <div className="p-3 border-b border-slate-700">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                      <Star className="w-3 h-3" />
                      Saved Searches
                    </div>
                    <div className="space-y-1">
                      {savedSearches.map((search, index) => (
                        <div
                          key={`saved-${index}`}
                          className="flex items-center gap-2 group"
                        >
                          <button
                            onClick={() => {
                              setQuery(search);
                              handleSearch(search);
                            }}
                            className="flex-1 text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                            data-testid={`button-saved-search-${index}`}
                          >
                            {search}
                          </button>
                          <button
                            onClick={() => toggleSavedSearch(search)}
                            className="p-1.5 text-yellow-500 hover:bg-slate-700 rounded-lg"
                            data-testid={`button-unsave-search-${index}`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recentSearches.length > 0 && (
                  <div className="p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                      <History className="w-3 h-3" />
                      Recent Searches
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <div
                          key={`recent-${index}`}
                          className="flex items-center gap-2 group"
                        >
                          <button
                            onClick={() => {
                              setQuery(search);
                              handleSearch(search);
                            }}
                            className="flex-1 text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                            data-testid={`button-recent-search-${index}`}
                          >
                            {search}
                          </button>
                          <button
                            onClick={() => toggleSavedSearch(search)}
                            className={`p-1.5 hover:bg-slate-700 rounded-lg ${
                              savedSearches.includes(search)
                                ? "text-yellow-500"
                                : "text-slate-500 hover:text-yellow-500"
                            }`}
                            data-testid={`button-save-search-${index}`}
                          >
                            <Star className={`w-4 h-4 ${savedSearches.includes(search) ? "fill-current" : ""}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {exampleQueries.map((exampleQuery, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(exampleQuery);
                  handleSearch(exampleQuery);
                }}
                className="px-3 py-1.5 text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-full border border-slate-700 hover:border-slate-600 transition-colors"
                data-testid={`chip-example-${index}`}
              >
                {exampleQuery}
              </button>
            ))}
          </div>
        </div>

        {searchPerformed && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-semibold text-slate-200">
                  {loading ? "Searching..." : `${results.length} Results`}
                </h2>
                {results.length > 0 && (
                  <div className="flex items-center gap-3">
                    {compareList.length >= 2 && (
                      <button
                        onClick={() => setShowCompareModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg text-sm text-white font-medium flex items-center gap-2"
                        data-testid="button-compare"
                      >
                        <Users className="w-4 h-4" />
                        Compare ({compareList.length})
                      </button>
                    )}
                    {compareList.length > 0 && compareList.length < 2 && (
                      <span className="text-xs text-slate-400">
                        Select {2 - compareList.length} more to compare
                      </span>
                    )}
                    {compareList.length === 0 && (
                      <span className="text-xs text-slate-400">
                        Check boxes to compare
                      </span>
                    )}
                    <button
                      onClick={exportToCSV}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 flex items-center gap-2"
                      data-testid="button-export-csv"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  </div>
                )}
              </div>

              {results.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Filters</span>
                  </div>
                  <div className="flex gap-3 flex-wrap items-center">
                    <select
                      value={filters.platform}
                      onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                      className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-300"
                      data-testid="select-platform"
                    >
                      <option value="all">All Platforms</option>
                      <option value="GitHub">GitHub</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Blog">Blog</option>
                    </select>

                    <select
                      value={filters.matchStatus}
                      onChange={(e) => setFilters({ ...filters, matchStatus: e.target.value })}
                      className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-300"
                      data-testid="select-match-status"
                    >
                      <option value="all">All Matches</option>
                      <option value="match">Match Only</option>
                      <option value="miss">Miss Only</option>
                    </select>

                    <select
                      value={filters.dateRange}
                      onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                      className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-300"
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
                      className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-300"
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

                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2">
                      <label className="text-sm text-slate-400 whitespace-nowrap">Score:</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.minScore}
                        onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
                        className="w-24 accent-blue-500"
                        data-testid="slider-min-score"
                      />
                      <span className="text-sm text-slate-300 w-10">{filters.minScore}%</span>
                    </div>

                    {(filters.platform !== "all" || filters.matchStatus !== "all" || filters.dateRange !== "all" || filters.location !== "all" || filters.minScore > 0) && (
                      <button
                        onClick={() => setFilters({ platform: "all", matchStatus: "all", minScore: 0, dateRange: "all", location: "all" })}
                        className="px-3 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                        data-testid="button-clear-filters"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              )}

              <ScrollArea className="h-[calc(100vh-480px)]">
                <div className="space-y-3 pr-4">
                  {loading ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
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
                        <div className="text-center py-12 text-slate-400">
                          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No results found. Try adjusting filters or a different query.</p>
                        </div>
                      );
                    }
                    
                    return filteredResults.map((result, index) => (
                      <Card
                        key={result.id + index}
                        onClick={() => setSelectedCandidate(result)}
                        className={`p-4 cursor-pointer transition-all duration-200 animate-slideInLeft ${
                          selectedCandidate?.id === result.id
                            ? "bg-slate-700/50 border-blue-500/50"
                            : "bg-slate-800/50 border-slate-700 hover:bg-slate-700/30 hover:border-slate-600"
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                        data-testid={`card-result-${index}`}
                      >
                        <div className="flex items-start gap-3 group">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompareCandidate(result);
                            }}
                            className="mt-1 text-slate-500 hover:text-blue-400 transition-colors"
                            data-testid={`checkbox-compare-${index}`}
                          >
                            {compareList.some((c) => c.url === result.url) ? (
                              <CheckSquare className="w-5 h-5 text-blue-400" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                          <div className={`p-2 rounded-lg ${getPlatformColor(result.platform)}`}>
                            {getPlatformIcon(result.platform)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
                                {result.name || result.author || "Unknown"}
                              </h3>
                              <div className="flex items-center gap-2 shrink-0">
                                {result.matchStatus === "match" ? (
                                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Match
                                  </Badge>
                                ) : result.matchStatus === "miss" ? (
                                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Miss
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                              {result.role || result.subtitle || result.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span className="text-xs text-slate-400">
                                {result.publishedDate ? new Date(result.publishedDate).toLocaleDateString() : "Recent"}
                              </span>
                              {result.score !== undefined && result.score !== null && result.score > 0 && (
                                <span className="flex items-center gap-1 text-xs text-slate-400 ml-2">
                                  <TrendingUp className="h-3 w-3" />
                                  {Math.round(result.score * 100)}%
                                </span>
                              )}
                            </div>
                            {result.highlights && result.highlights.length > 0 && (
                              <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                                {result.highlights[0]}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ));
                  })()}
                </div>
              </ScrollArea>
            </div>

            <div className="hidden lg:block animate-slideInRight">
              <div className="sticky top-6">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl overflow-hidden">
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
                            <p className="text-xs text-slate-400 mt-1">
                              {formatDate(selectedCandidate.publishedDate)}
                            </p>
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-slate-100 mb-2">
                        {selectedCandidate.name || selectedCandidate.author || selectedCandidate.title}
                      </h3>
                      {selectedCandidate.subtitle && (
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                          {selectedCandidate.subtitle}
                        </p>
                      )}

                      {selectedCandidate.text && (
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                            Preview
                          </h4>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {selectedCandidate.text.slice(0, 300)}
                            {selectedCandidate.text.length > 300 && "..."}
                          </p>
                        </div>
                      )}

                      {selectedCandidate.highlights && selectedCandidate.highlights.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                            Key Highlights
                          </h4>
                          <ul className="space-y-2">
                            {selectedCandidate.highlights.slice(0, 3).map((highlight, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Rating</span>
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
                                    : "text-slate-600"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Status</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {statusTags.map((tag) => {
                            const isActive = getCandidateData(selectedCandidate).tags.includes(tag);
                            const tagColors: Record<string, string> = {
                              Contacted: isActive ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-slate-700/50 text-slate-400 border-slate-600",
                              Interview: isActive ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-slate-700/50 text-slate-400 border-slate-600",
                              Rejected: isActive ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-slate-700/50 text-slate-400 border-slate-600",
                              "Follow-up": isActive ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-slate-700/50 text-slate-400 border-slate-600",
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
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Notes</span>
                        </div>
                        <Textarea
                          placeholder="Add notes about this candidate..."
                          value={getCandidateData(selectedCandidate).notes}
                          onChange={(e) => updateCandidateData(selectedCandidate, { notes: e.target.value })}
                          className="bg-slate-900 border-slate-600 text-slate-300 placeholder:text-slate-500 text-sm resize-none"
                          rows={3}
                          data-testid="textarea-notes"
                        />
                      </div>

                      <button
                        onClick={generateEmail}
                        disabled={generatingEmail}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 mb-3"
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
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-slate-500" />
                      </div>
                      <p className="text-slate-400 text-sm">
                        Select a candidate to view their digital footprint
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-slate-100">Draft Outreach Email</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                data-testid="button-close-modal"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed">
                {emailDraft}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-700 flex gap-3">
              <button
                onClick={copyEmail}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
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
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
                data-testid="button-close-email"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompareModal && compareList.length >= 2 && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-slate-100">Compare Candidates</h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                data-testid="button-close-compare"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className={`grid gap-4 ${compareList.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {compareList.map((candidate, index) => (
                  <div key={candidate.url} className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700">
                      <div className={`p-2 rounded-lg ${getPlatformColor(candidate.platform)}`}>
                        {getPlatformIcon(candidate.platform)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-100 truncate">
                          {candidate.name || candidate.author || "Unknown"}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          {candidate.role || candidate.subtitle || candidate.platform}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h5 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <TrendingUp className="w-3 h-3" />
                          Match Score
                        </h5>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{ width: `${Math.round((candidate.score || 0) * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-300">
                            {Math.round((candidate.score || 0) * 100)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                          Experience Level
                        </h5>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          {extractExperienceLevel(candidate)}
                        </Badge>
                      </div>

                      <div>
                        <h5 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                          Skills Detected
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {extractSkills(candidate).length > 0 ? (
                            extractSkills(candidate).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs border-slate-600 text-slate-300">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">No skills detected</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          Recent Activity
                        </h5>
                        <span className="text-sm text-slate-300">
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
                        <h5 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                          Match Status
                        </h5>
                        {candidate.matchStatus === "match" ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Match
                          </Badge>
                        ) : candidate.matchStatus === "miss" ? (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            <XCircle className="h-3 w-3 mr-1" />
                            Miss
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-600/20 text-slate-400 border-slate-500/30">
                            Unknown
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <a
                        href={candidate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
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
            <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setCompareList([]);
                  setShowCompareModal(false);
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
                data-testid="button-clear-compare"
              >
                Clear Selection
              </button>
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
                data-testid="button-done-compare"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
