import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, Clock, TrendingUp, Calendar, Briefcase } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Candidate } from "@shared/schema";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Dashboard() {
  const { data: candidates = [], isLoading } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const stats = {
    total: candidates.length,
    applied: candidates.filter((c) => c.stage === "applied").length,
    screening: candidates.filter((c) => c.stage === "screening").length,
    interview: candidates.filter((c) => c.stage === "interview").length,
    offer: candidates.filter((c) => c.stage === "offer").length,
    hired: candidates.filter((c) => c.stage === "hired").length,
  };

  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 5);

  const interviewCandidates = candidates.filter((c) => c.stage === "interview");

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your recruiting pipeline
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Candidates"
          value={stats.total}
          trend="up"
          trendValue="+12%"
          subtitle="vs last month"
          icon={Users}
        />
        <StatsCard
          title="In Pipeline"
          value={stats.screening + stats.interview + stats.offer}
          trend="up"
          trendValue="+8%"
          subtitle="active candidates"
          icon={Clock}
        />
        <StatsCard
          title="Interviews"
          value={stats.interview}
          trend="neutral"
          subtitle="scheduled this week"
          icon={Calendar}
        />
        <StatsCard
          title="Hired"
          value={stats.hired}
          trend="up"
          trendValue="+25%"
          subtitle="this quarter"
          icon={UserCheck}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentCandidates.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground" data-testid="empty-recent">
                No candidates yet. Add your first candidate to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {recentCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center gap-3 p-2 rounded-md hover-elevate"
                    data-testid={`recent-candidate-${candidate.id}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(candidate.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{candidate.role}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(candidate.appliedDate)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Upcoming Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interviewCandidates.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground" data-testid="empty-interviews">
                No interviews scheduled. Move candidates to the interview stage.
              </div>
            ) : (
              <div className="space-y-3">
                {interviewCandidates.slice(0, 5).map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center gap-3 p-2 rounded-md hover-elevate"
                    data-testid={`interview-candidate-${candidate.id}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(candidate.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{candidate.role}</p>
                    </div>
                    <Badge variant="default" className="text-xs">
                      Interview
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Pipeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Applied", value: stats.applied, color: "bg-secondary" },
              { label: "Screening", value: stats.screening, color: "bg-chart-4/20" },
              { label: "Interview", value: stats.interview, color: "bg-primary/20" },
              { label: "Offer", value: stats.offer, color: "bg-chart-3/20" },
              { label: "Hired", value: stats.hired, color: "bg-chart-2/20" },
            ].map((stage) => (
              <div
                key={stage.label}
                className={`p-4 rounded-md ${stage.color} text-center`}
                data-testid={`pipeline-stat-${stage.label.toLowerCase()}`}
              >
                <p className="text-2xl font-semibold">{stage.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stage.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
