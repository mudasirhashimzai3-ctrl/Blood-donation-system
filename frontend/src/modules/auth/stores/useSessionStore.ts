import { create } from "zustand";
import { devtools } from "zustand/middleware";

const DEFAULT_SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_MS = 2 * 60 * 1000; // 2 minutes before timeout

interface SessionState {
  lastActivity: number;
  showTimeoutWarning: boolean;
  isSessionActive: boolean;
  sessionTimeoutMs: number;

  // Actions
  updateActivity: () => void;
  resetSession: () => void;
  showWarning: () => void;
  hideWarning: () => void;
  endSession: () => void;
  getRemainingTime: () => number;
  setSessionTimeoutMinutes: (minutes: number) => void;
}

/**
 * Session Store
 * Manages user session timeout and activity tracking
 */
export const useSessionStore = create<SessionState>()(
  devtools(
    (set, get) => ({
      lastActivity: Date.now(),
      showTimeoutWarning: false,
      isSessionActive: true,
      sessionTimeoutMs: DEFAULT_SESSION_TIMEOUT_MS,

      /**
       * Update last activity timestamp
       * Called on any user interaction
       */
      updateActivity: () => {
        set({
          lastActivity: Date.now(),
          showTimeoutWarning: false,
        });
      },

      /**
       * Reset session to initial state
       * Called when user explicitly chooses to stay logged in
       */
      resetSession: () => {
        set({
          lastActivity: Date.now(),
          showTimeoutWarning: false,
          isSessionActive: true,
        });
      },

      /**
       * Show timeout warning modal
       * Called 2 minutes before session expires
       */
      showWarning: () => set({ showTimeoutWarning: true }),

      /**
       * Hide timeout warning modal
       */
      hideWarning: () => set({ showTimeoutWarning: false }),

      /**
       * End the current session
       * Called when session timeout is reached
       */
      endSession: () =>
        set({
          isSessionActive: false,
          showTimeoutWarning: false,
        }),

      /**
       * Get remaining time before session expires
       * @returns Remaining time in milliseconds
       */
      getRemainingTime: () => {
        const { lastActivity, sessionTimeoutMs } = get();
        const elapsed = Date.now() - lastActivity;
        return Math.max(0, sessionTimeoutMs - elapsed);
      },
      setSessionTimeoutMinutes: (minutes: number) => {
        const safeMinutes = Number.isFinite(minutes) ? Math.max(5, Math.floor(minutes)) : 30;
        set({ sessionTimeoutMs: safeMinutes * 60 * 1000 });
      },
    }),
    { name: "session-store" }
  )
);

// Export constants for use in other modules
export { DEFAULT_SESSION_TIMEOUT_MS as SESSION_TIMEOUT_MS, WARNING_BEFORE_MS };
