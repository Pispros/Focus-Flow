import * as SQLite from "expo-sqlite";

// Types
export interface Session {
  id: number;
  duration_minutes: number;
  started_at: string;
  ended_at: string | null;
  completed: boolean;
  created_at: string;
}

export interface DailyStats {
  date: string;
  total_minutes: number;
  sessions_count: number;
  completed_count: number;
}

export interface OverallStats {
  total_sessions: number;
  total_minutes: number;
  avg_session_minutes: number;
  current_streak: number;
  best_day_minutes: number;
  completed_sessions: number;
}

// Database instance
let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

// Initialize database
export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync("focusflow.db");

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      duration_minutes INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
  `);
}

// Get database instance
function getDb(): SQLite.SQLiteDatabase {
  if (!db)
    throw new Error("Database not initialized. Call initDatabase() first.");
  return db;
}

// ============ SESSION CRUD ============

export async function createSession(durationMinutes: number): Promise<number> {
  const database = getDb();
  const startedAt = new Date().toISOString();

  const result = await database.runAsync(
    "INSERT INTO sessions (duration_minutes, started_at) VALUES (?, ?)",
    [durationMinutes, startedAt]
  );

  return result.lastInsertRowId;
}

export async function completeSession(sessionId: number): Promise<void> {
  const database = getDb();
  const endedAt = new Date().toISOString();

  await database.runAsync(
    "UPDATE sessions SET ended_at = ?, completed = 1 WHERE id = ?",
    [endedAt, sessionId]
  );
}

export async function cancelSession(sessionId: number): Promise<void> {
  const database = getDb();
  const endedAt = new Date().toISOString();

  await database.runAsync(
    "UPDATE sessions SET ended_at = ?, completed = 0 WHERE id = ?",
    [endedAt, sessionId]
  );
}

export async function deleteSession(sessionId: number): Promise<void> {
  const database = getDb();
  await database.runAsync("DELETE FROM sessions WHERE id = ?", [sessionId]);
}

export async function getSession(sessionId: number): Promise<Session | null> {
  const database = getDb();
  const result = await database.getFirstAsync<Session>(
    "SELECT * FROM sessions WHERE id = ?",
    [sessionId]
  );
  return result || null;
}

export async function getAllSessions(limit = 50): Promise<Session[]> {
  const database = getDb();
  return await database.getAllAsync<Session>(
    "SELECT * FROM sessions ORDER BY started_at DESC LIMIT ?",
    [limit]
  );
}

// ============ STATS QUERIES ============

// Get today's total focus time and sessions
export async function getTodayStats(): Promise<{
  totalMinutes: number;
  sessionsCount: number;
}> {
  const database = getDb();
  const today = new Date().toISOString().split("T")[0];

  const result = await database.getFirstAsync<{ total: number; count: number }>(
    `
    SELECT 
      COALESCE(SUM(duration_minutes), 0) as total,
      COUNT(*) as count
    FROM sessions 
    WHERE date(started_at) = date(?) AND completed = 1
  `,
    [today]
  );

  return {
    totalMinutes: result?.total || 0,
    sessionsCount: result?.count || 0,
  };
}

// Get stats for the last N days
export async function getDailyStats(days = 7): Promise<DailyStats[]> {
  const database = getDb();

  return await database.getAllAsync<DailyStats>(`
    SELECT 
      date(started_at) as date,
      COALESCE(SUM(duration_minutes), 0) as total_minutes,
      COUNT(*) as sessions_count,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_count
    FROM sessions 
    WHERE started_at >= datetime('now', '-${days} days', 'localtime')
    GROUP BY date(started_at)
    ORDER BY date(started_at) DESC
  `);
}

// Get weekly stats (for the bar chart)
export async function getWeeklyChartData(): Promise<
  { day: string; hours: number; date: string }[]
> {
  const database = getDb();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get last 7 days of data
  const results = await database.getAllAsync<{
    date: string;
    total_minutes: number;
  }>(`
    SELECT 
      date(started_at) as date,
      COALESCE(SUM(duration_minutes), 0) as total_minutes
    FROM sessions 
    WHERE started_at >= datetime('now', '-7 days', 'localtime') AND completed = 1
    GROUP BY date(started_at)
  `);

  // Create a map for quick lookup
  const dataMap = new Map(results.map((r) => [r.date, r.total_minutes]));

  // Generate last 7 days
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayName = days[date.getDay()];
    const minutes = dataMap.get(dateStr) || 0;

    chartData.push({
      day: dayName,
      hours: Number((minutes / 60).toFixed(1)),
      date: dateStr,
    });
  }

  return chartData;
}

// Calculate current streak
export async function getCurrentStreak(): Promise<number> {
  const database = getDb();

  const results = await database.getAllAsync<{ date: string }>(`
    SELECT DISTINCT date(started_at) as date
    FROM sessions 
    WHERE completed = 1
    ORDER BY date(started_at) DESC
  `);

  if (results.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < results.length; i++) {
    const sessionDate = new Date(results[i].date);
    sessionDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (sessionDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else if (
      i === 0 &&
      sessionDate.getTime() === expectedDate.getTime() - 86400000
    ) {
      // Allow streak to continue if yesterday was the last session
      continue;
    } else {
      break;
    }
  }

  return streak;
}

// Get overall stats
export async function getOverallStats(): Promise<OverallStats> {
  const database = getDb();

  const totals = await database.getFirstAsync<{
    total_sessions: number;
    total_minutes: number;
    completed_sessions: number;
  }>(`
    SELECT 
      COUNT(*) as total_sessions,
      COALESCE(SUM(duration_minutes), 0) as total_minutes,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_sessions
    FROM sessions
  `);

  const bestDay = await database.getFirstAsync<{ max_minutes: number }>(`
    SELECT COALESCE(MAX(daily_total), 0) as max_minutes
    FROM (
      SELECT SUM(duration_minutes) as daily_total
      FROM sessions
      WHERE completed = 1
      GROUP BY date(started_at)
    )
  `);

  const streak = await getCurrentStreak();

  const totalSessions = totals?.total_sessions || 0;
  const completedSessions = totals?.completed_sessions || 0;

  return {
    total_sessions: totalSessions,
    total_minutes: totals?.total_minutes || 0,
    avg_session_minutes:
      completedSessions > 0
        ? Math.round((totals?.total_minutes || 0) / completedSessions)
        : 0,
    current_streak: streak,
    best_day_minutes: bestDay?.max_minutes || 0,
    completed_sessions: completedSessions,
  };
}

// Get recent sessions with formatted data
export async function getRecentSessions(limit = 5): Promise<
  {
    date: string;
    displayDate: string;
    sessions: number;
    duration: string;
    completed: boolean;
  }[]
> {
  const database = getDb();

  const results = await database.getAllAsync<{
    date: string;
    sessions_count: number;
    total_minutes: number;
    all_completed: number;
  }>(
    `
    SELECT 
      date(started_at) as date,
      COUNT(*) as sessions_count,
      SUM(duration_minutes) as total_minutes,
      MIN(completed) as all_completed
    FROM sessions
    GROUP BY date(started_at)
    ORDER BY date(started_at) DESC
    LIMIT ?
  `,
    [limit]
  );

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  return results.map((r) => ({
    date: r.date,
    displayDate:
      r.date === today
        ? "Today"
        : r.date === yesterday
        ? "Yesterday"
        : formatDate(r.date),
    sessions: r.sessions_count,
    duration: formatDuration(r.total_minutes),
    completed: r.all_completed === 1,
  }));
}

// ============ HELPERS ============

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ============ DEV HELPERS ============

export async function seedTestData(): Promise<void> {
  const database = getDb();

  // Clear existing data
  await database.runAsync("DELETE FROM sessions");

  // Seed last 14 days of data
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const sessionsCount = Math.floor(Math.random() * 4) + 1;

    for (let j = 0; j < sessionsCount; j++) {
      const duration = [15, 25, 30, 45, 60][Math.floor(Math.random() * 5)];
      const startHour = 8 + Math.floor(Math.random() * 10);
      const startDate = new Date(date);
      startDate.setHours(startHour, Math.floor(Math.random() * 60), 0, 0);

      const endDate = new Date(startDate.getTime() + duration * 60000);
      const completed = Math.random() > 0.1;

      await database.runAsync(
        `INSERT INTO sessions (duration_minutes, started_at, ended_at, completed, created_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          duration,
          startDate.toISOString(),
          endDate.toISOString(),
          completed ? 1 : 0,
          startDate.toISOString(),
        ]
      );
    }
  }
}

export async function clearAllData(): Promise<void> {
  const database = getDb();
  await database.runAsync("DELETE FROM sessions");
}

export interface GroupedSession {
  date: string;
  displayDate: string;
  totalMinutes: number;
  sessions: Session[];
}

export async function getAllSessionsGroupedByDate(): Promise<GroupedSession[]> {
  const database = await getDb();

  const sessions = await database.getAllAsync<Session>(
    "SELECT * FROM sessions ORDER BY started_at DESC"
  );

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const grouped: Map<string, GroupedSession> = new Map();

  sessions.forEach((session) => {
    const date = session.started_at.split("T")[0];

    if (!grouped.has(date)) {
      let displayDate = formatDateLong(date);
      if (date === today) displayDate = "Today";
      else if (date === yesterday) displayDate = "Yesterday";

      grouped.set(date, {
        date,
        displayDate,
        totalMinutes: 0,
        sessions: [],
      });
    }

    const group = grouped.get(date)!;
    group.sessions.push({
      ...session,
      completed: Boolean(session.completed),
    });
    if (session.completed) {
      group.totalMinutes += session.duration_minutes;
    }
  });

  return Array.from(grouped.values());
}

function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
