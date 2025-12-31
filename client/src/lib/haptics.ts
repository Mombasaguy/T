/**
 * Haptic Feedback Utilities
 * Provides haptic feedback on supported devices (iOS, Android)
 */

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Triggers haptic feedback if available on the device
 */
export function triggerHaptic(style: HapticStyle = 'light') {
  // Check if the browser supports the Vibration API
  if ('vibrate' in navigator) {
    const patterns: Record<HapticStyle, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 50, 10],
      warning: [10, 100, 10],
      error: [10, 50, 10, 50, 10],
    };

    navigator.vibrate(patterns[style]);
  }

  // For iOS devices that support Taptic Engine (via webkit)
  if ('ontouchstart' in window) {
    try {
      // iOS Haptic Feedback (requires user gesture)
      const event = new CustomEvent('haptic', { detail: { style } });
      window.dispatchEvent(event);
    } catch (e) {
      // Silently fail if not supported
    }
  }
}

/**
 * Convenience functions for common haptic patterns
 */
export const haptics = {
  tap: () => triggerHaptic('light'),
  impact: () => triggerHaptic('medium'),
  notification: {
    success: () => triggerHaptic('success'),
    warning: () => triggerHaptic('warning'),
    error: () => triggerHaptic('error'),
  },
  selection: () => triggerHaptic('light'),
};
