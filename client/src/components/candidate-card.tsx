import { Mail, Phone, Star, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Candidate, CandidateStageType } from "@shared/schema";

interface CandidateCardProps {
  candidate: Candidate;
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: string) => void;
  onStageChange: (id: string, stage: CandidateStageType) => void;
}

const stageConfig: Record<CandidateStageType, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  applied: { label: "Applied", variant: "secondary" },
  screening: { label: "Screening", variant: "outline" },
  interview: { label: "Interview", variant: "default" },
  offer: { label: "Offer", variant: "default" },
  hired: { label: "Hired", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getRatingStars(rating: string | null): number {
  if (!rating) return 0;
  const num = parseInt(rating, 10);
  return isNaN(num) ? 0 : Math.min(5, Math.max(0, num));
}

export function CandidateCard({ candidate, onEdit, onDelete, onStageChange }: CandidateCardProps) {
  const stage = stageConfig[candidate.stage as CandidateStageType] || stageConfig.applied;
  const rating = getRatingStars(candidate.rating);

  return (
    <Card 
      className="group hover-elevate cursor-pointer transition-all"
      data-testid={`card-candidate-${candidate.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              {candidate.avatarUrl && <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />}
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-medium truncate" data-testid={`text-candidate-name-${candidate.id}`}>
                  {candidate.name}
                </h3>
                <Badge variant={stage.variant} className="text-xs">
                  {stage.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate" data-testid={`text-candidate-role-${candidate.id}`}>
                {candidate.role}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate max-w-[120px]">{candidate.email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
              </div>
              {rating > 0 && (
                <div className="flex items-center gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i <= rating ? "fill-chart-4 text-chart-4" : "text-muted"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                data-testid={`button-candidate-menu-${candidate.id}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(candidate)} data-testid={`button-edit-${candidate.id}`}>
                Edit Candidate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStageChange(candidate.id, "screening")} data-testid={`button-move-screening-${candidate.id}`}>
                Move to Screening
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStageChange(candidate.id, "interview")} data-testid={`button-move-interview-${candidate.id}`}>
                Move to Interview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStageChange(candidate.id, "offer")} data-testid={`button-move-offer-${candidate.id}`}>
                Move to Offer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStageChange(candidate.id, "hired")} data-testid={`button-move-hired-${candidate.id}`}>
                Mark as Hired
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(candidate.id)} 
                className="text-destructive"
                data-testid={`button-delete-${candidate.id}`}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
