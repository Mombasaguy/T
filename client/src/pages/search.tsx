import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, Loader2, ExternalLink, Globe, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SearchResult {
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
}

export default function CandidateSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string): Promise<SearchResponse> => {
      const response = await apiRequest("POST", "/api/search", { query: searchQuery });
      return response as unknown as SearchResponse;
    },
    onSuccess: (data) => {
      setResults(data.results || []);
      if (data.results?.length === 0) {
        toast({ title: "No results found", description: "Try a different search query" });
      }
    },
    onError: (error) => {
      toast({ 
        title: "Search failed", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchMutation.mutate(query.trim());
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">
          Candidate Search
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Use AI-powered search to find candidates across the web
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for candidates, skills, or companies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            data-testid="input-exa-search"
          />
        </div>
        <Button
          type="submit"
          disabled={searchMutation.isPending || !query.trim()}
          data-testid="button-search"
        >
          {searchMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </form>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" data-testid="badge-results-count">
              {results.length} results
            </Badge>
          </div>

          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-4 pr-4">
              {results.map((result, index) => (
                <Card key={index} className="hover-elevate" data-testid={`card-result-${index}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-medium line-clamp-2">
                          {result.title}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                            data-testid={`link-result-${index}`}
                          >
                            <Globe className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">
                              {new URL(result.url).hostname}
                            </span>
                          </a>
                          {formatDate(result.publishedDate) && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(result.publishedDate)}</span>
                            </div>
                          )}
                          {result.author && (
                            <span className="text-xs text-muted-foreground">
                              by {result.author}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="flex-shrink-0"
                      >
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`button-open-${index}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  {(result.text || result.highlights?.length) && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {result.highlights?.[0] || result.text}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {!searchMutation.isPending && results.length === 0 && (
        <div className="py-16 text-center" data-testid="empty-search">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Find candidates with AI search</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Search for candidates by skills, experience, company, or any other criteria.
            Our AI-powered search will find relevant profiles across the web.
          </p>
        </div>
      )}
    </div>
  );
}
