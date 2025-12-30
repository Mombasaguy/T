import { Users } from "lucide-react";

export function EmptyCandidatesState() {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <Users className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No saved candidates yet
      </h3>
      <p className="text-gray-500 text-sm max-w-sm mx-auto">
        Saved candidates will appear here as you review search results.
      </p>
    </div>
  );
}
