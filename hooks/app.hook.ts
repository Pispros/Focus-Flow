import { useCallback, useEffect, useState } from "react";
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
  seedTestData,
} from "../services/app.service";

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

// Hook for Stats screen
export function useStats(): UseStatsReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    totalMinutes: 0,
    sessionsCount: 0,
    formattedTime: "0m",
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
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const weeklyTotal = formatDuration(
    Math.round(weeklyData.reduce((sum, d) => sum + d.hours * 60, 0))
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

// Hook for Timer screen - manages active session
interface UseTimerReturn {
  isRunning: boolean;
  currentSessionId: number | null;
  startSession: (durationMinutes: number) => Promise<void>;
  finishSession: () => Promise<void>;
  cancelCurrentSession: () => Promise<void>;
}

export function useTimer(): UseTimerReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

  const startSession = useCallback(async (durationMinutes: number) => {
    const sessionId = await createSession(durationMinutes);
    setCurrentSessionId(sessionId);
    setIsRunning(true);
  }, []);

  const finishSession = useCallback(async () => {
    if (currentSessionId) {
      await completeSession(currentSessionId);
      setCurrentSessionId(null);
      setIsRunning(false);
    }
  }, [currentSessionId]);

  const cancelCurrentSession = useCallback(async () => {
    if (currentSessionId) {
      await cancelSession(currentSessionId);
      setCurrentSessionId(null);
      setIsRunning(false);
    }
  }, [currentSessionId]);

  return {
    isRunning,
    currentSessionId,
    startSession,
    finishSession,
    cancelCurrentSession,
  };
}

// Hook for database initialization
export function useDatabase() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Database init failed");
      }
    };
    init();
  }, []);

  const seedData = useCallback(async () => {
    await seedTestData();
  }, []);

  return { isReady, error, seedData };
}
