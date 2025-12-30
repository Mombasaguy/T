import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getOnboardingState, setFirstCandidateSaved } from "@/lib/onboarding";
import { Bookmark } from "lucide-react";

interface FirstSavePromptProps {
  onSave: () => void;
  delaySeconds?: number;
}

export function FirstSavePrompt({ onSave, delaySeconds = 10 }: FirstSavePromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const state = getOnboardingState();
    if (state.firstCandidateSaved) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [delaySeconds]);

  const handleSave = () => {
    setFirstCandidateSaved();
    onSave();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50 md:hidden">
      <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
        <p className="text-sm text-gray-700 flex-1">
          Save this candidate to review later?
        </p>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            data-testid="button-not-now"
          >
            Not now
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-save-candidate-prompt"
          >
            <Bookmark className="w-4 h-4 mr-1" />
            Save Candidate
          </Button>
        </div>
      </div>
    </div>
  );
}
