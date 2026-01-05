import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Search, Filter, LayoutGrid, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CandidateCard } from "@/components/candidate-card";
import { CandidateDialog } from "@/components/candidate-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Candidate, CandidateFormData, CandidateStageType } from "@shared/schema";

export default function Candidates() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const { data: candidates = [], isLoading } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const createMutation = useMutation({
    mutationFn: (data: CandidateFormData) => apiRequest("POST", "/api/candidates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      setDialogOpen(false);
      toast({ title: "Candidate added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add candidate", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CandidateFormData }) =>
      apiRequest("PATCH", `/api/candidates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      setDialogOpen(false);
      setEditingCandidate(null);
      toast({ title: "Candidate updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update candidate", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/candidates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({ title: "Candidate deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete candidate", variant: "destructive" });
    },
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: CandidateStageType }) =>
      apiRequest("PATCH", `/api/candidates/${id}/stage`, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({ title: "Stage updated" });
    },
    onError: () => {
      toast({ title: "Failed to update stage", variant: "destructive" });
    },
  });

  const handleSubmit = (data: CandidateFormData) => {
    if (editingCandidate) {
      updateMutation.mutate({ id: editingCandidate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleStageChange = (id: string, stage: CandidateStageType) => {
    stageMutation.mutate({ id, stage });
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCandidate(null);
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      searchQuery === "" ||
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "all" || candidate.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all candidates in your pipeline
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-add-candidate">
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-40" data-testid="select-stage-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="screening">Screening</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            data-testid="button-view-grid"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            data-testid="button-view-list"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredCandidates.length === 0 ? (
        <div className="py-16 text-center" data-testid="empty-candidates">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">
            {candidates.length === 0 ? "No candidates yet" : "No candidates found"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchQuery || stageFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Run your first search to find qualified candidates, then save the ones you want to track here."}
          </p>
          {!searchQuery && stageFilter === "all" && candidates.length === 0 && (
            <Link href="/search">
              <Button className="mt-4" data-testid="button-search-candidates">
                <Search className="h-4 w-4 mr-2" />
                Find Candidates
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          }
        >
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStageChange={handleStageChange}
            />
          ))}
        </div>
      )}

      <CandidateDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        candidate={editingCandidate}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
