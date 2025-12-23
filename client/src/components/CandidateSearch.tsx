import { useState } from "react";
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
} from "lucide-react";
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

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setSearchPerformed(true);
    setSelectedCandidate(null);

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
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 bg-transparent border-0 text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  data-testid="input-search"
                />
              </div>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-200">
                  {loading ? "Searching..." : `${results.length} Results`}
                </h2>
                {results.length > 0 && (
                  <span className="text-xs text-slate-400">
                    Click a result to view details
                  </span>
                )}
              </div>

              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-3 pr-4">
                  {loading ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                  ) : results.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No results found. Try a different search query.</p>
                    </div>
                  ) : (
                    results.map((result, index) => (
                      <Card
                        key={result.id}
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
                    ))
                  )}
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
    </div>
  );
}
