import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [, setLocation] = useLocation();

  const handleStart = () => {
    localStorage.setItem("onboardingComplete", "started");
    setLocation("/search?onboarding=true");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="text-onboarding-title">
          Welcome to TalentPilot
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          TalentPilot helps recruiters find qualified candidates beyond job boards 
          by searching across public professional work.
        </p>
        
        <p className="text-gray-600 mb-8">
          Start by describing the person you're looking for. We'll take care of the rest.
        </p>

        <Button
          onClick={handleStart}
          className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3"
          data-testid="button-run-first-search"
        >
          Run Your First Search
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
