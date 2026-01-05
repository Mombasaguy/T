import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { getOnboardingState, setFirstCandidateOpened } from "@/lib/onboarding";

interface CandidateWhyCardProps {
  onDismiss?: () => void;
}

export function CandidateWhyCard({ onDismiss }: CandidateWhyCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const state = getOnboardingState();
    if (!state.firstCandidateOpened) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setFirstCandidateOpened();
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 text-blue-400 hover:text-blue-600 transition-colors"
        aria-label="Dismiss"
        data-testid="button-dismiss-why-card"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-lg shrink-0">
          <Sparkles className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h4 className="font-semibold text-blue-900 mb-2">
            Why this candidate surfaced
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Relevant experience aligned to your search</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Demonstrated work in public professional sources</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Recent and relevant signals</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
