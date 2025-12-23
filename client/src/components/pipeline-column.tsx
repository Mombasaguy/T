import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { GripVertical, Mail } from "lucide-react";
import type { Candidate, CandidateStageType } from "@shared/schema";

interface PipelineColumnProps {
  stage: CandidateStageType;
  label: string;
  candidates: Candidate[];
  onCandidateClick: (candidate: Candidate) => void;
  onDrop: (candidateId: string, newStage: CandidateStageType) => void;
}

const stageColors: Record<CandidateStageType, string> = {
  applied: "bg-secondary",
  screening: "bg-chart-4/20 text-chart-4",
  interview: "bg-primary/20 text-primary",
  offer: "bg-chart-3/20 text-chart-3",
  hired: "bg-chart-2/20 text-chart-2",
  rejected: "bg-destructive/20 text-destructive",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PipelineColumn({ stage, label, candidates, onCandidateClick, onDrop }: PipelineColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-accent/50");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-accent/50");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-accent/50");
    const candidateId = e.dataTransfer.getData("candidateId");
    if (candidateId) {
      onDrop(candidateId, stage);
    }
  };

  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    e.dataTransfer.setData("candidateId", candidateId);
  };

  return (
    <div 
      className="flex flex-col w-72 flex-shrink-0 bg-muted/30 rounded-md transition-colors"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid={`pipeline-column-${stage}`}
    >
      <div className="flex items-center justify-between gap-2 p-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{label}</h3>
          <Badge variant="secondary" className="text-xs" data-testid={`badge-count-${stage}`}>
            {candidates.length}
          </Badge>
        </div>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {candidates.map((candidate) => (
            <Card
              key={candidate.id}
              draggable
              onDragStart={(e) => handleDragStart(e, candidate.id)}
              onClick={() => onCandidateClick(candidate)}
              className="p-3 cursor-grab active:cursor-grabbing hover-elevate"
              data-testid={`pipeline-card-${candidate.id}`}
            >
              <div className="flex items-start gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 opacity-50" />
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {candidate.avatarUrl && <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(candidate.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{candidate.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{candidate.role}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {candidates.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground" data-testid={`empty-column-${stage}`}>
              No candidates
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
