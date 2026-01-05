export const STORAGE_KEYS = {
  HAS_RUN_SEARCH: 'tp_has_run_search',
  SEARCH_COUNT: 'tp_search_count',
} as const;

export function hasRunSearch(): boolean {
  return localStorage.getItem(STORAGE_KEYS.HAS_RUN_SEARCH) === 'true';
}

export function setHasRunSearch() {
  localStorage.setItem(STORAGE_KEYS.HAS_RUN_SEARCH, 'true');
}

export function incrementSearchCount(): number {
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.SEARCH_COUNT) || '0', 10);
  const newCount = current + 1;
  localStorage.setItem(STORAGE_KEYS.SEARCH_COUNT, newCount.toString());
  return newCount;
}

export function getSearchCount(): number {
  return parseInt(localStorage.getItem(STORAGE_KEYS.SEARCH_COUNT) || '0', 10);
}

export function trackEvent(eventName: string, data?: Record<string, unknown>) {
  console.log(`[TalentPilot Event] ${eventName}`, data || '');
}

export function resetState() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

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
