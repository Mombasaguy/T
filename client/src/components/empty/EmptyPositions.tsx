import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyPositionsProps {
  onCreateClick?: () => void;
}

export function EmptyPositions({ onCreateClick }: EmptyPositionsProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <Briefcase className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No job positions yet
      </h3>
      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">
        Create your first position to start organizing candidates by role and tracking your hiring pipeline.
      </p>
      {onCreateClick && (
        <Button onClick={onCreateClick} data-testid="button-empty-create-position">
          <Plus className="w-4 h-4 mr-2" />
          Create Position
        </Button>
      )}
    </div>
  );
}
