import { Link } from "wouter";
import { Kanban, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyPipelineProps {
  showCTA?: boolean;
}

export function EmptyPipeline({ showCTA = true }: EmptyPipelineProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <Kanban className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Your pipeline is empty
      </h3>
      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">
        Start by finding candidates. Once you save them, you can track their progress through your hiring stages here.
      </p>
      {showCTA && (
        <Link href="/search">
          <Button data-testid="button-empty-pipeline-search">
            <Search className="w-4 h-4 mr-2" />
            Find Candidates
          </Button>
        </Link>
      )}
    </div>
  );
}
