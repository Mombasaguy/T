import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  BarChart3,
  Search,
  TrendingUp,
  Percent,
  ArrowLeft,
  Calendar,
  Target,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchStat {
  query: string;
  timestamp: number;
  resultCount: number;
  matchCount: number;
  platforms: Record<string, number>;
}

export default function Stats() {
  const [stats, setStats] = useState<SearchStat[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("searchStats");
    if (stored) {
      setStats(JSON.parse(stored));
    }
  }, []);

  const now = new Date();
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

  const weeklyStats = stats.filter((s) => s.timestamp >= weekAgo);
  const monthlyStats = stats.filter((s) => s.timestamp >= monthAgo);

  const totalSearchesWeek = weeklyStats.length;
  const totalSearchesMonth = monthlyStats.length;

  const totalResults = stats.reduce((sum, s) => sum + s.resultCount, 0);
  const totalMatches = stats.reduce((sum, s) => sum + s.matchCount, 0);
  const successRate = totalResults > 0 ? Math.round((totalMatches / totalResults) * 100) : 0;

  const queryFrequency: Record<string, number> = {};
  stats.forEach((s) => {
    const normalized = s.query.toLowerCase().trim();
    queryFrequency[normalized] = (queryFrequency[normalized] || 0) + 1;
  });
  const topQueries = Object.entries(queryFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const platformTotals: Record<string, number> = {};
  stats.forEach((s) => {
    Object.entries(s.platforms).forEach(([platform, count]) => {
      platformTotals[platform] = (platformTotals[platform] || 0) + count;
    });
  });
  const topPlatforms = Object.entries(platformTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const totalPlatformResults = Object.values(platformTotals).reduce((a, b) => a + b, 0);

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "GitHub":
        return "bg-slate-700 text-slate-200";
      case "LinkedIn":
        return "bg-blue-600 text-white";
      case "Blog":
        return "bg-orange-500 text-white";
      default:
        return "bg-purple-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <a className="p-2 hover:bg-slate-800 rounded-lg transition-colors" data-testid="link-back">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </a>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Search Analytics</h1>
              <p className="text-sm text-slate-400">Track your recruiting performance</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Search className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm text-slate-400">Searches This Week</span>
            </div>
            <p className="text-3xl font-bold text-slate-100" data-testid="stat-weekly-searches">
              {totalSearchesWeek}
            </p>
            <p className="text-xs text-slate-500 mt-1">{totalSearchesMonth} this month</p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-400">Total Results</span>
            </div>
            <p className="text-3xl font-bold text-slate-100" data-testid="stat-total-results">
              {totalResults}
            </p>
            <p className="text-xs text-slate-500 mt-1">{totalMatches} matches found</p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Percent className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm text-slate-400">Match Rate</span>
            </div>
            <p className="text-3xl font-bold text-slate-100" data-testid="stat-success-rate">
              {successRate}%
            </p>
            <p className="text-xs text-slate-500 mt-1">of results are matches</p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-sm text-slate-400">All-Time Searches</span>
            </div>
            <p className="text-3xl font-bold text-slate-100" data-testid="stat-all-time">
              {stats.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">since you started</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-slate-100">Most Common Searches</h2>
            </div>
            {topQueries.length > 0 ? (
              <div className="space-y-3">
                {topQueries.map(([query, count], index) => (
                  <div
                    key={query}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                    data-testid={`top-query-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300">
                        {index + 1}
                      </span>
                      <span className="text-sm text-slate-300 truncate max-w-[200px]">{query}</span>
                    </div>
                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                      {count} {count === 1 ? "time" : "times"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No searches yet. Start searching to see your stats!</p>
              </div>
            )}
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-slate-100">Results by Platform</h2>
            </div>
            {topPlatforms.length > 0 ? (
              <div className="space-y-4">
                {topPlatforms.map(([platform, count], index) => {
                  const percentage = totalPlatformResults > 0 ? Math.round((count / totalPlatformResults) * 100) : 0;
                  return (
                    <div key={platform} data-testid={`platform-stat-${index}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getPlatformColor(platform)}>{platform}</Badge>
                        </div>
                        <span className="text-sm text-slate-400">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No platform data yet. Run some searches!</p>
              </div>
            )}
          </Card>
        </div>

        {stats.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 p-6 mt-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-slate-100">Recent Activity</h2>
            </div>
            <div className="space-y-2">
              {stats.slice(-10).reverse().map((stat, index) => (
                <div
                  key={stat.timestamp}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                  data-testid={`recent-activity-${index}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">{stat.query}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(stat.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                      {stat.resultCount} results
                    </Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      {stat.matchCount} matches
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
