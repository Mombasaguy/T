import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { setOnboardingCompleted, trackEvent, ONBOARDING_EVENTS } from "@/lib/onboarding";
import { Search } from "lucide-react";

export function OnboardingWelcome() {
  const [, setLocation] = useLocation();

  const handleStartSearch = () => {
    trackEvent(ONBOARDING_EVENTS.ONBOARDING_STARTED);
    setOnboardingCompleted();
    setLocation("/search?onboarding=1");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
          <Search className="w-8 h-8 text-blue-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to TalentPilot
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          TalentPilot helps recruiters find qualified candidates beyond job boards by searching across public professional work. Start by describing the person you're looking for.
        </p>
        
        <Button
          onClick={handleStartSearch}
          className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
          data-testid="button-run-first-search"
        >
          Run Your First Search
        </Button>
      </div>
    </div>
  );
}
