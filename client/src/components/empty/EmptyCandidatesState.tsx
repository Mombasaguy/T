import { Link } from "wouter";
import { Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyCandidatesStateProps {
  showCTA?: boolean;
}

export function EmptyCandidatesState({ showCTA = true }: EmptyCandidatesStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <Users className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No candidates yet
      </h3>
      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">
        Run your first search to find qualified candidates, then save the ones you want to track.
      </p>
      {showCTA && (
        <Link href="/search">
          <Button data-testid="button-empty-run-search">
            <Search className="w-4 h-4 mr-2" />
            Run a Search
          </Button>
        </Link>
      )}
    </div>
  );
}
