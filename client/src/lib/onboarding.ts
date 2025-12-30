export const ONBOARDING_KEYS = {
  ONBOARDING_COMPLETED: 'tp_onboarding_completed',
  FIRST_SEARCH_COMPLETED: 'tp_first_search_completed',
  FIRST_CANDIDATE_OPENED: 'tp_first_candidate_opened',
  FIRST_CANDIDATE_SAVED: 'tp_first_candidate_saved',
  SEARCH_COUNT: 'tp_search_count',
} as const;

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
