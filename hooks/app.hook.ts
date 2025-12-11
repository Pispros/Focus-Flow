/* eslint-disable react-hooks/exhaustive-deps */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Vibration } from 'react-native';
import { useTimerContext } from '../contexts/TimerContext';
import BackgroundTimer from '../modules/background-timer';
import { useDeviceUnlock } from '../modules/device-unlock/useDeviceUnlock';
import { showSessionCompletedNotification } from '../modules/notification';
import {
  cancelSession,
  completeSession,
  createSession,
  formatDuration,
  getOverallStats,
  getRecentSessions,
  getTodayStats,
  getWeeklyChartData,
  initDatabase,
  OverallStats,
} from '../services/app.service';

// Storage keys
const TIMER_STATE_KEY = 'focusflow_timer_state';

interface TimerState {
  sessionId: number | null;
  endTime: number | null; // Unix timestamp when timer should end
  durationMinutes: number;
  startedAt: number;
}

interface UseTimerReturn {
  isRunning: boolean;
  remainingSeconds: number;
  durationMinutes: number;
  currentSessionId: number | null;
  startSession: (durationMinutes: number) => Promise<void>;
  finishSession: () => Promise<void>;
  cancelCurrentSession: () => Promise<void>;
}

export function useTimer(): UseTimerReturn {
  const {
    isRunning,
    setIsRunning,
    remainingSeconds,
    setRemainingSeconds,
    durationMinutes,
    setDurationMinutes,
    currentSessionId,
    setCurrentSessionId,
    endTime,
    setEndTime,
  } = useTimerContext();

  const intervalRef = useRef<any>(null);

  // Persist timer state
  const saveTimerState = useCallback(async (state: TimerState | null) => {
    if (state) {
      await AsyncStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
    } else {
      await AsyncStorage.removeItem(TIMER_STATE_KEY);
    }
  }, []);

  // Restore timer state (for app restart or background)
  const restoreTimerState = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(TIMER_STATE_KEY);
      if (!stored) return null;

      const state: TimerState = JSON.parse(stored);
      const now = Date.now();

      // Check if timer has expired
      if (state.endTime && now >= state.endTime) {
        // Timer completed while app was closed - mark session complete
        if (state.sessionId) {
          await completeSession(state.sessionId);
        }
        await saveTimerState(null);
        return null;
      }

      return state;
    } catch {
      return null;
    }
  }, [saveTimerState]);

  // Calculate remaining time from end timestamp
  const calculateRemaining = useCallback(() => {
    if (!endTime) return 0;
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    return remaining;
  }, [endTime]);

  // Start countdown interval
  const startCountdown = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Schedule background timer check (works even when app is in background)
    if (endTime && currentSessionId) {
      BackgroundTimer.scheduleTimerCheck(
        endTime,
        durationMinutes,
        currentSessionId,
      );
      console.log(
        '[FocusFlow] Background timer scheduled for',
        new Date(endTime),
      );
    }

    intervalRef.current = setInterval(async () => {
      const remaining = calculateRemaining();
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        // Timer complete!
        if (intervalRef.current) clearInterval(intervalRef.current);
        BackgroundTimer.cancelTimerCheck(); // Cancel background job since we handled it

        // Complete the session in database
        if (currentSessionId) {
          await completeSession(currentSessionId);
          await saveTimerState(null);
          setIsRunning(false);
          setCurrentSessionId(null);
          setEndTime(null);
          restartSamePreviousSession();
        }

        // Show notification with app icon and custom message
        showSessionCompletedNotification(durationMinutes);
        // Vibrate (works on real devices, not emulator) - longer pattern
        Vibration.vibrate([0, 1000, 500, 1000, 500, 1000]);
      }
    }, 100); // Update frequently for smooth display
  }, [
    endTime,
    calculateRemaining,
    currentSessionId,
    durationMinutes,
    setRemainingSeconds,
    setIsRunning,
    setCurrentSessionId,
    setEndTime,
    saveTimerState,
  ]);

  // Stop countdown
  const stopCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    BackgroundTimer.cancelTimerCheck(); // Also cancel background timer
  }, []);

  const restartSamePreviousSession = useCallback(async () => {
    // Start a new session with the same duration
    const newSessionId = await createSession(durationMinutes);
    const now = Date.now();
    const end = now + durationMinutes * 60 * 1000;

    const newState: TimerState = {
      sessionId: newSessionId,
      endTime: end,
      durationMinutes: durationMinutes,
      startedAt: now,
    };

    await saveTimerState(newState);

    // Reset state with new session
    setCurrentSessionId(newSessionId);
    setEndTime(end);
    setRemainingSeconds(durationMinutes * 60);
    setIsRunning(true);
    // Restart countdown
    startCountdown();
  }, [
    isRunning,
    currentSessionId,
    durationMinutes,
    saveTimerState,
    startCountdown,
  ]);

  // Reset timer (called on device unlock)
  const resetTimer = useCallback(async () => {
    try {
      if (!isRunning || !currentSessionId) return;

      // Cancel current session (removes it from database without recording)
      await cancelSession(currentSessionId);

      restartSamePreviousSession();

      console.log(
        '[FocusFlow] Unfinished session removed, new session started on device unlock',
      );
    } catch (error) {
      console.log(error);
    }
  }, [
    isRunning,
    currentSessionId,
    durationMinutes,
    saveTimerState,
    startCountdown,
  ]);

  // Listen for device unlock - THIS IS THE KEY INTEGRATION
  useDeviceUnlock({
    onUnlock: timestamp => {
      console.log('[FocusFlow] Device unlocked at:', new Date(timestamp));
      resetTimer();
    },
    onLock: timestamp => {
      console.log('[FocusFlow] Device locked at:', new Date(timestamp));
      // Stop countdown completely when phone is locked
      stopCountdown();
    },
  });

  // Listen for background timer completion events
  useEffect(() => {
    const { NativeEventEmitter, NativeModules } = require('react-native');
    const eventEmitter = new NativeEventEmitter(NativeModules.BackgroundTimer);

    const subscription = eventEmitter.addListener(
      'onTimerCompleted',
      async (event: any) => {
        console.log(
          '[FocusFlow] Background timer completed event received:',
          event,
        );

        // Timer expired while app was in background - complete and restart immediately
        const { sessionId, durationMinutes: duration } = event;

        if (sessionId) {
          await completeSession(sessionId);
          await saveTimerState(null);
        }

        // Show notification with vibration
        showSessionCompletedNotification(duration);
        Vibration.vibrate([0, 1000, 500, 1000, 500, 1000]);

        // Restart with same duration
        const newSessionId = await createSession(duration);
        const now = Date.now();
        const end = now + duration * 60 * 1000;

        const newState: TimerState = {
          sessionId: newSessionId,
          endTime: end,
          durationMinutes: duration,
          startedAt: now,
        };

        await saveTimerState(newState);

        setCurrentSessionId(newSessionId);
        setEndTime(end);
        setDurationMinutes(duration);
        setRemainingSeconds(duration * 60);
        setIsRunning(true);

        // Restart countdown (will reschedule background timer)
        startCountdown();

        console.log('[FocusFlow] Session restarted in background');
      },
    );

    return () => {
      subscription.remove();
    };
  }, [saveTimerState, startCountdown]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        // App came to foreground - recalculate remaining time
        const state = await restoreTimerState();
        if (state && state.endTime) {
          const remaining = Math.max(
            0,
            Math.floor((state.endTime - Date.now()) / 1000),
          );

          if (remaining > 0) {
            // Timer still running
            setIsRunning(true);
            setCurrentSessionId(state.sessionId);
            setEndTime(state.endTime);
            setDurationMinutes(state.durationMinutes);
            setRemainingSeconds(remaining);
            startCountdown();
          } else {
            // Timer expired while in background - trigger completion
            console.log(
              '[FocusFlow] Timer expired while in background, completing session...',
            );

            if (state.sessionId) {
              await completeSession(state.sessionId);
              await saveTimerState(null);
            }

            // Show notification with vibration (NOW in foreground)
            showSessionCompletedNotification(state.durationMinutes);
            Vibration.vibrate([0, 1000, 500, 1000, 500, 1000]);

            // Restart with same duration
            const newSessionId = await createSession(state.durationMinutes);
            const now = Date.now();
            const end = now + state.durationMinutes * 60 * 1000;

            const newState: TimerState = {
              sessionId: newSessionId,
              endTime: end,
              durationMinutes: state.durationMinutes,
              startedAt: now,
            };

            await saveTimerState(newState);

            setCurrentSessionId(newSessionId);
            setEndTime(end);
            setDurationMinutes(state.durationMinutes);
            setRemainingSeconds(state.durationMinutes * 60);
            setIsRunning(true);
            startCountdown();
          }
        }
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [restoreTimerState, saveTimerState, startCountdown]);

  // Restore state on mount
  useEffect(() => {
    (async () => {
      const state = await restoreTimerState();
      if (state && state.endTime) {
        const remaining = Math.max(
          0,
          Math.floor((state.endTime - Date.now()) / 1000),
        );

        if (remaining > 0) {
          setIsRunning(true);
          setCurrentSessionId(state.sessionId);
          setEndTime(state.endTime);
          setDurationMinutes(state.durationMinutes);
          setRemainingSeconds(remaining);
          startCountdown();
        }
      }
    })();
  }, [restoreTimerState, startCountdown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCountdown();
  }, [stopCountdown]);

  // Start a new session
  const startSession = useCallback(
    async (minutes: number) => {
      const sessionId = await createSession(minutes);
      const now = Date.now();
      const end = now + minutes * 60 * 1000;

      const state: TimerState = {
        sessionId,
        endTime: end,
        durationMinutes: minutes,
        startedAt: now,
      };

      await saveTimerState(state);

      setCurrentSessionId(sessionId);
      setEndTime(end);
      setDurationMinutes(minutes);
      setRemainingSeconds(minutes * 60);
      setIsRunning(true);
      startCountdown();
    },
    [saveTimerState, startCountdown],
  );

  // Complete session manually
  const finishSession = useCallback(async () => {
    if (currentSessionId) {
      await completeSession(currentSessionId);
      await saveTimerState(null);

      stopCountdown();
      setCurrentSessionId(null);
      setEndTime(null);
      setIsRunning(false);
      setRemainingSeconds(0);
    }
  }, [currentSessionId, saveTimerState, stopCountdown]);

  // Cancel session
  const cancelCurrentSession = useCallback(async () => {
    if (currentSessionId) {
      await cancelSession(currentSessionId);
      await saveTimerState(null);

      stopCountdown();
      setCurrentSessionId(null);
      setEndTime(null);
      setIsRunning(false);
      setRemainingSeconds(0);
    }
  }, [currentSessionId, saveTimerState, stopCountdown]);

  return {
    isRunning,
    remainingSeconds,
    durationMinutes,
    currentSessionId,
    startSession,
    finishSession,
    cancelCurrentSession,
  };
}

// ============ STATS HOOK (unchanged) ============

interface TodayStats {
  totalMinutes: number;
  sessionsCount: number;
  formattedTime: string;
}

interface WeeklyData {
  day: string;
  hours: number;
  date: string;
}

interface RecentSession {
  date: string;
  displayDate: string;
  sessions: number;
  duration: string;
  completed: boolean;
}

interface UseStatsReturn {
  isLoading: boolean;
  error: string | null;
  todayStats: TodayStats;
  weeklyData: WeeklyData[];
  overallStats: OverallStats;
  recentSessions: RecentSession[];
  weeklyTotal: string;
  refresh: () => Promise<void>;
}

export function useStats(): UseStatsReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    totalMinutes: 0,
    sessionsCount: 0,
    formattedTime: '0m',
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats>({
    total_sessions: 0,
    total_minutes: 0,
    avg_session_minutes: 0,
    current_streak: 0,
    best_day_minutes: 0,
    completed_sessions: 0,
  });
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [today, weekly, overall, recent] = await Promise.all([
        getTodayStats(),
        getWeeklyChartData(),
        getOverallStats(),
        getRecentSessions(5),
      ]);

      setTodayStats({
        ...today,
        formattedTime: formatDuration(today.totalMinutes),
      });
      setWeeklyData(weekly);
      setOverallStats(overall);
      setRecentSessions(recent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const weeklyTotal = formatDuration(
    Math.round(weeklyData.reduce((sum, d) => sum + d.hours * 60, 0)),
  );

  return {
    isLoading,
    error,
    todayStats,
    weeklyData,
    overallStats,
    recentSessions,
    weeklyTotal,
    refresh: loadStats,
  };
}

// ============ DATABASE HOOK (unchanged) ============

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Database init failed');
      }
    };
    init();
  }, []);

  return { isReady, error };
}
