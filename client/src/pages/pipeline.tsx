import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PipelineColumn } from "@/components/pipeline-column";
import { CandidateDialog } from "@/components/candidate-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Candidate, CandidateFormData, CandidateStageType } from "@shared/schema";

const pipelineStages: { stage: CandidateStageType; label: string }[] = [
  { stage: "applied", label: "Applied" },
  { stage: "screening", label: "Screening" },
  { stage: "interview", label: "Interview" },
  { stage: "offer", label: "Offer" },
  { stage: "hired", label: "Hired" },
  { stage: "rejected", label: "Rejected" },
];

export default function Pipeline() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const { toast } = useToast();

  const { data: candidates = [], isLoading } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
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

  const handleCandidateClick = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setDialogOpen(true);
  };

  const handleDrop = (candidateId: string, newStage: CandidateStageType) => {
    stageMutation.mutate({ id: candidateId, stage: newStage });
  };

  const handleSubmit = (data: CandidateFormData) => {
    if (editingCandidate) {
      updateMutation.mutate({ id: editingCandidate.id, data });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCandidate(null);
    }
  };

  const getCandidatesForStage = (stage: CandidateStageType) =>
    candidates.filter((c) => c.stage === stage);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-[500px] w-72 flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Drag and drop candidates between stages
        </p>
      </div>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="flex gap-4 pb-4 h-[calc(100vh-200px)]">
          {pipelineStages.map(({ stage, label }) => (
            <PipelineColumn
              key={stage}
              stage={stage}
              label={label}
              candidates={getCandidatesForStage(stage)}
              onCandidateClick={handleCandidateClick}
              onDrop={handleDrop}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <CandidateDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        candidate={editingCandidate}
        onSubmit={handleSubmit}
        isPending={updateMutation.isPending}
      />
    </div>
  );
}
