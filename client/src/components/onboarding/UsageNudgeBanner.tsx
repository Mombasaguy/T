import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getUsageNudgeMessage, trackEvent, ONBOARDING_EVENTS } from "@/lib/onboarding";
import { AlertCircle, X } from "lucide-react";

interface UsageNudgeBannerProps {
  maxFreeSearches?: number;
  searchCount?: number;
}

export function UsageNudgeBanner({ maxFreeSearches = 10, searchCount = 0 }: UsageNudgeBannerProps) {
  const [nudge, setNudge] = useState<{ message: string; showUpgrade: boolean } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const nudgeMessage = getUsageNudgeMessage(searchCount, maxFreeSearches);
    setNudge(nudgeMessage);
    
    if (nudgeMessage?.showUpgrade && searchCount >= maxFreeSearches) {
      trackEvent(ONBOARDING_EVENTS.PAYWALL_SHOWN);
    }
    
    if (nudgeMessage) {
      setDismissed(false);
    }
  }, [searchCount, maxFreeSearches]);

  if (!nudge || dismissed) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-amber-800">{nudge.message}</p>
          {nudge.showUpgrade && (
            <Link href="/pricing">
              <Button
                size="sm"
                className="mt-2 bg-amber-600 hover:bg-amber-700"
                data-testid="button-view-plans"
              >
                View Plans
              </Button>
            </Link>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400 hover:text-amber-600 shrink-0"
          aria-label="Dismiss"
          data-testid="button-dismiss-nudge"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
