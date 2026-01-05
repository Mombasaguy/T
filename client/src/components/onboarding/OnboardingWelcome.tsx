import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  setOnboardingCompleted, 
  setUserContext, 
  trackEvent, 
  ONBOARDING_EVENTS,
  type UserContext,
  DEFAULT_USER_CONTEXT 
} from "@/lib/onboarding";
import { 
  Search, 
  Users, 
  Building2, 
  Target, 
  Briefcase, 
  UserCheck,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";

const TOTAL_STEPS = 4;

const ROLE_OPTIONS = [
  { value: 'recruiter', label: 'Recruiter', description: 'I source and screen candidates for open roles' },
  { value: 'hiring_manager', label: 'Hiring Manager', description: 'I make final hiring decisions for my team' },
  { value: 'agency', label: 'Recruiting Agency', description: 'I hire on behalf of multiple clients' },
  { value: 'founder', label: 'Founder / Executive', description: 'I build teams for my company' },
  { value: 'hr_lead', label: 'HR Lead', description: 'I oversee hiring across the organization' },
] as const;

const VOLUME_OPTIONS = [
  { value: 'low', label: '1-5 hires per month', description: 'Focused, selective hiring' },
  { value: 'medium', label: '6-20 hires per month', description: 'Steady team growth' },
  { value: 'high', label: '20+ hires per month', description: 'High-volume recruiting' },
] as const;

const USE_CASE_OPTIONS = [
  { value: 'source', label: 'Source Candidates', icon: Search, description: 'Find qualified people beyond job boards' },
  { value: 'pipeline', label: 'Manage Pipeline', icon: Users, description: 'Track candidates through hiring stages' },
  { value: 'outreach', label: 'Run Outreach', icon: Target, description: 'Contact and engage candidates' },
  { value: 'all', label: 'All of the Above', icon: Briefcase, description: 'Full recruiting workflow' },
] as const;

function ProgressIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 w-8 rounded-full transition-colors ${i < currentStep ? 'bg-blue-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );
}

function OptionCard({ 
  selected, 
  onClick, 
  label, 
  description, 
  icon: Icon 
}: { 
  selected: boolean; 
  onClick: () => void; 
  label: string; 
  description: string;
  icon?: typeof Search;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        selected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      data-testid={`option-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Icon className={`w-5 h-5 ${selected ? 'text-blue-600' : 'text-gray-500'}`} />
          </div>
        )}
        <div className="flex-1">
          <p className={`font-medium ${selected ? 'text-blue-900' : 'text-gray-900'}`}>{label}</p>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
            <UserCheck className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
    </button>
  );
}

export function OnboardingWelcome() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [context, setContext] = useState<UserContext>(DEFAULT_USER_CONTEXT);

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = (action: 'search' | 'position') => {
    trackEvent(ONBOARDING_EVENTS.ONBOARDING_STARTED);
    setUserContext(context);
    setOnboardingCompleted();
    
    if (action === 'search') {
      setLocation("/search?onboarding=1");
    } else {
      setLocation("/positions?new=1");
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return context.role !== '';
      case 2: return context.companyName.trim() !== '' && context.hiringVolume !== '';
      case 3: return context.primaryUseCase !== '';
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <ProgressIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
        
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to TalentPilot
            </h1>
            <p className="text-gray-600 mb-6">
              What best describes your role?
            </p>
            <div className="space-y-3">
              {ROLE_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  selected={context.role === option.value}
                  onClick={() => setContext({ ...context, role: option.value })}
                  label={option.label}
                  description={option.description}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Tell us about your company
            </h1>
            <p className="text-gray-600 mb-6">
              This helps us tailor the experience for you.
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company name
                </label>
                <Input
                  value={context.companyName}
                  onChange={(e) => setContext({ ...context, companyName: e.target.value })}
                  placeholder="Your company name"
                  className="w-full"
                  data-testid="input-company-name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Typical hiring volume
                </label>
                <div className="space-y-3">
                  {VOLUME_OPTIONS.map((option) => (
                    <OptionCard
                      key={option.value}
                      selected={context.hiringVolume === option.value}
                      onClick={() => setContext({ ...context, hiringVolume: option.value })}
                      label={option.label}
                      description={option.description}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              What will you use TalentPilot for?
            </h1>
            <p className="text-gray-600 mb-6">
              Choose your primary focus to get the most relevant experience.
            </p>
            <div className="space-y-3">
              {USE_CASE_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  selected={context.primaryUseCase === option.value}
                  onClick={() => setContext({ ...context, primaryUseCase: option.value })}
                  label={option.label}
                  description={option.description}
                  icon={option.icon}
                />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                You're all set!
              </h1>
              <p className="text-gray-600">
                Choose how you'd like to get started.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleComplete('search')}
                className="w-full p-4 rounded-lg border-2 border-blue-500 bg-blue-50 text-left hover:bg-blue-100 transition-colors"
                data-testid="button-start-search"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">Run your first search</p>
                    <p className="text-sm text-gray-500">Find qualified candidates beyond job boards</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-500" />
                </div>
              </button>
              
              <button
                onClick={() => handleComplete('position')}
                className="w-full p-4 rounded-lg border-2 border-gray-200 bg-white text-left hover:border-gray-300 transition-colors"
                data-testid="button-create-position"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Create a job position</p>
                    <p className="text-sm text-gray-500">Set up roles and build your pipeline</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            </div>
          </div>
        )}

        {step < TOTAL_STEPS && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <Button variant="ghost" onClick={handleBack} data-testid="button-back">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button 
              onClick={handleNext} 
              disabled={!canProceed()}
              data-testid="button-next"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
        
        {step === TOTAL_STEPS && (
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Button variant="ghost" onClick={handleBack} data-testid="button-back-final">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
