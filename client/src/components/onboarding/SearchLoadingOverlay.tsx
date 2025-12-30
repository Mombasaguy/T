import { Loader2 } from "lucide-react";

interface SearchLoadingOverlayProps {
  isVisible: boolean;
}

export function SearchLoadingOverlay({ isVisible }: SearchLoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center p-8">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Searching public professional profiles...
        </h2>
        <p className="text-gray-600">
          Looking at experience, work, and relevant professional signals.
        </p>
      </div>
    </div>
  );
}
