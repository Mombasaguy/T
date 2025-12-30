export const ONBOARDING_KEYS = {
  ONBOARDING_COMPLETED: 'tp_onboarding_completed',
  FIRST_SEARCH_COMPLETED: 'tp_first_search_completed',
  FIRST_CANDIDATE_OPENED: 'tp_first_candidate_opened',
  FIRST_CANDIDATE_SAVED: 'tp_first_candidate_saved',
  SEARCH_COUNT: 'tp_search_count',
  USER_CONTEXT: 'tp_user_context',
  DEMO_MODE: 'tp_demo_mode',
} as const;

export interface UserContext {
  role: 'recruiter' | 'hiring_manager' | 'agency' | 'founder' | 'hr_lead' | '';
  companyName: string;
  hiringVolume: 'low' | 'medium' | 'high' | '';
  primaryUseCase: 'source' | 'pipeline' | 'outreach' | 'all' | '';
}

export const DEFAULT_USER_CONTEXT: UserContext = {
  role: '',
  companyName: '',
  hiringVolume: '',
  primaryUseCase: '',
};

export const ONBOARDING_EVENTS = {
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  FIRST_SEARCH_COMPLETED: 'first_search_completed',
  CANDIDATE_OPENED: 'candidate_opened',
  CANDIDATE_SAVED: 'candidate_saved',
  PAYWALL_SHOWN: 'paywall_shown',
} as const;

export function getOnboardingState() {
  return {
    onboardingCompleted: localStorage.getItem(ONBOARDING_KEYS.ONBOARDING_COMPLETED) === 'true',
    firstSearchCompleted: localStorage.getItem(ONBOARDING_KEYS.FIRST_SEARCH_COMPLETED) === 'true',
    firstCandidateOpened: localStorage.getItem(ONBOARDING_KEYS.FIRST_CANDIDATE_OPENED) === 'true',
    firstCandidateSaved: localStorage.getItem(ONBOARDING_KEYS.FIRST_CANDIDATE_SAVED) === 'true',
    searchCount: parseInt(localStorage.getItem(ONBOARDING_KEYS.SEARCH_COUNT) || '0', 10),
  };
}

export function setOnboardingCompleted() {
  localStorage.setItem(ONBOARDING_KEYS.ONBOARDING_COMPLETED, 'true');
  trackEvent(ONBOARDING_EVENTS.ONBOARDING_COMPLETED);
}

export function setFirstSearchCompleted() {
  localStorage.setItem(ONBOARDING_KEYS.FIRST_SEARCH_COMPLETED, 'true');
  trackEvent(ONBOARDING_EVENTS.FIRST_SEARCH_COMPLETED);
}

export function setFirstCandidateOpened() {
  localStorage.setItem(ONBOARDING_KEYS.FIRST_CANDIDATE_OPENED, 'true');
  trackEvent(ONBOARDING_EVENTS.CANDIDATE_OPENED);
}

export function setFirstCandidateSaved() {
  localStorage.setItem(ONBOARDING_KEYS.FIRST_CANDIDATE_SAVED, 'true');
  trackEvent(ONBOARDING_EVENTS.CANDIDATE_SAVED);
}

export function incrementSearchCount(): number {
  const current = parseInt(localStorage.getItem(ONBOARDING_KEYS.SEARCH_COUNT) || '0', 10);
  const newCount = current + 1;
  localStorage.setItem(ONBOARDING_KEYS.SEARCH_COUNT, newCount.toString());
  return newCount;
}

export function trackEvent(eventName: string, data?: Record<string, unknown>) {
  console.log(`[TalentPilot Event] ${eventName}`, data || '');
}

export function resetOnboarding() {
  Object.values(ONBOARDING_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

export function getUserContext(): UserContext {
  try {
    const stored = localStorage.getItem(ONBOARDING_KEYS.USER_CONTEXT);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse user context', e);
  }
  return DEFAULT_USER_CONTEXT;
}

export function setUserContext(context: UserContext) {
  localStorage.setItem(ONBOARDING_KEYS.USER_CONTEXT, JSON.stringify(context));
  trackEvent('user_context_saved', context as unknown as Record<string, unknown>);
}

export function isDemoMode(): boolean {
  return localStorage.getItem(ONBOARDING_KEYS.DEMO_MODE) === 'true';
}

export function setDemoMode(enabled: boolean) {
  localStorage.setItem(ONBOARDING_KEYS.DEMO_MODE, enabled ? 'true' : 'false');
  trackEvent('demo_mode_toggled', { enabled });
}

export function getRoleLabel(role: UserContext['role']): string {
  const labels: Record<string, string> = {
    recruiter: 'Recruiter',
    hiring_manager: 'Hiring Manager',
    agency: 'Recruiting Agency',
    founder: 'Founder / Executive',
    hr_lead: 'HR Lead',
  };
  return labels[role] || 'User';
}

export const PREFILLED_SEARCH_QUERY = "Senior backend engineer with fintech experience who's worked on payments systems";

export const USAGE_NUDGE_THRESHOLDS = {
  REFINEMENT_REMINDER: 4,
  UPGRADE_TIMING: 8,
  LIMIT_REACHED: 10,
} as const;

export function getUsageNudgeMessage(searchCount: number, maxFreeSearches: number = 10): { message: string; showUpgrade: boolean } | null {
  if (searchCount >= maxFreeSearches) {
    return {
      message: "You've used your free searches. Upgrade to continue sourcing, saving, and managing candidates.",
      showUpgrade: true,
    };
  }
  if (searchCount >= USAGE_NUDGE_THRESHOLDS.UPGRADE_TIMING) {
    return {
      message: "Recruiting teams usually upgrade once they've identified candidates they want to follow up with.",
      showUpgrade: true,
    };
  }
  if (searchCount >= USAGE_NUDGE_THRESHOLDS.REFINEMENT_REMINDER) {
    return {
      message: `You've used ${searchCount} of your ${maxFreeSearches} free searches. Most recruiters refine searches a few times before finding strong matches.`,
      showUpgrade: false,
    };
  }
  return null;
}
