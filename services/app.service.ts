import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

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

// Initialize database
export async function initDatabase(): Promise<void> {
  try {
    db = await SQLite.openDatabase({
      name: 'focusflow.db',
      location: 'default',
    });

    await db.executeSql('PRAGMA journal_mode = WAL');

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        duration_minutes INTEGER NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        completed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      )
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        in_use INTEGER DEFAULT 0
      )
    `);

    await db.executeSql(
      `CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at)`,
    );
    await db.executeSql(
      `CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at)`,
    );
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Get database instance
function getDb(): SQLite.SQLiteDatabase {
  if (!db)
    throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

// ============ SESSION CRUD ============

export async function createSession(durationMinutes: number): Promise<number> {
  try {
    const database = getDb();
    const startedAt = new Date().toISOString();

    const [result] = await database.executeSql(
      'INSERT INTO sessions (duration_minutes, started_at) VALUES (?, ?)',
      [durationMinutes, startedAt],
    );

    return result.insertId;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

export async function completeSession(sessionId: number): Promise<void> {
  try {
    const database = getDb();
    const endedAt = new Date().toISOString();

    await database.executeSql(
      'UPDATE sessions SET ended_at = ?, completed = 1 WHERE id = ?',
      [endedAt, sessionId],
    );
  } catch (error) {
    console.error('Error completing session:', error);
    throw error;
  }
}

export async function cancelSession(sessionId: number): Promise<void> {
  try {
    const database = getDb();
    const endedAt = new Date().toISOString();

    await database.executeSql(
      'UPDATE sessions SET ended_at = ?, completed = 0 WHERE id = ?',
      [endedAt, sessionId],
    );
  } catch (error) {
    console.error('Error canceling session:', error);
    throw error;
  }
}

export async function deleteSession(sessionId: number): Promise<void> {
  try {
    const database = getDb();
    await database.executeSql('DELETE FROM sessions WHERE id = ?', [sessionId]);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

export async function getSession(sessionId: number): Promise<Session | null> {
  try {
    const database = getDb();
    const [result] = await database.executeSql(
      'SELECT * FROM sessions WHERE id = ?',
      [sessionId],
    );
    return result.rows.length > 0 ? result.rows.item(0) : null;
  } catch (error) {
    console.error('Error getting session:', error);
    throw error;
  }
}

export async function getAllSessions(limit = 50): Promise<Session[]> {
  try {
    const database = getDb();
    const [result] = await database.executeSql(
      'SELECT * FROM sessions ORDER BY started_at DESC LIMIT ?',
      [limit],
    );

    const sessions: Session[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      sessions.push(result.rows.item(i));
    }
    return sessions;
  } catch (error) {
    console.error('Error getting all sessions:', error);
    throw error;
  }
}

// ============ STATS QUERIES ============

// Get today's total focus time and sessions
export async function getTodayStats(): Promise<{
  totalMinutes: number;
  sessionsCount: number;
}> {
  try {
    const database = getDb();
    const today = new Date().toISOString().split('T')[0];

    const [result] = await database.executeSql(
      `
      SELECT 
        COALESCE(SUM(duration_minutes), 0) as total,
        COUNT(*) as count
      FROM sessions 
      WHERE date(started_at) = date(?) AND completed = 1
    `,
      [today],
    );

    const row = result.rows.item(0);
    return {
      totalMinutes: row.total || 0,
      sessionsCount: row.count || 0,
    };
  } catch (error) {
    console.error('Error getting today stats:', error);
    throw error;
  }
}

// Get stats for the last N days
export async function getDailyStats(days = 7): Promise<DailyStats[]> {
  try {
    const database = getDb();

    const [result] = await database.executeSql(`
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

    const stats: DailyStats[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      stats.push(result.rows.item(i));
    }
    return stats;
  } catch (error) {
    console.error('Error getting daily stats:', error);
    throw error;
  }
}

// Get weekly stats (for the bar chart)
export async function getWeeklyChartData(): Promise<
  { day: string; hours: number; date: string }[]
> {
  try {
    const database = getDb();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get last 7 days of data
    const [result] = await database.executeSql(`
      SELECT 
        date(started_at) as date,
        COALESCE(SUM(duration_minutes), 0) as total_minutes
      FROM sessions 
      WHERE started_at >= datetime('now', '-7 days', 'localtime') AND completed = 1
      GROUP BY date(started_at)
    `);

    // Create a map for quick lookup
    const dataMap = new Map();
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      dataMap.set(row.date, row.total_minutes);
    }

    // Generate last 7 days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];
      const minutes = dataMap.get(dateStr) || 0;

      chartData.push({
        day: dayName,
        hours: Number((minutes / 60).toFixed(1)),
        date: dateStr,
      });
    }

    return chartData;
  } catch (error) {
    console.error('Error getting weekly chart data:', error);
    throw error;
  }
}

// Calculate current streak
export async function getCurrentStreak(): Promise<number> {
  try {
    const database = getDb();

    const [result] = await database.executeSql(`
      SELECT DISTINCT date(started_at) as date
      FROM sessions 
      WHERE completed = 1
      ORDER BY date(started_at) DESC
    `);

    if (result.rows.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      const sessionDate = new Date(row.date);
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
  } catch (error) {
    console.error('Error getting current streak:', error);
    throw error;
  }
}

// Get overall stats
export async function getOverallStats(): Promise<OverallStats> {
  try {
    const database = getDb();

    const [totalsResult] = await database.executeSql(`
      SELECT 
        COUNT(*) as total_sessions,
        COALESCE(SUM(duration_minutes), 0) as total_minutes,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_sessions
      FROM sessions
    `);

    const [bestDayResult] = await database.executeSql(`
      SELECT COALESCE(MAX(daily_total), 0) as max_minutes
      FROM (
        SELECT SUM(duration_minutes) as daily_total
        FROM sessions
        WHERE completed = 1
        GROUP BY date(started_at)
      )
    `);

    const streak = await getCurrentStreak();

    const totals = totalsResult.rows.item(0);
    const bestDay = bestDayResult.rows.item(0);
    const totalSessions = totals.total_sessions || 0;
    const completedSessions = totals.completed_sessions || 0;

    return {
      total_sessions: totalSessions,
      total_minutes: totals.total_minutes || 0,
      avg_session_minutes:
        completedSessions > 0
          ? Math.round((totals.total_minutes || 0) / completedSessions)
          : 0,
      current_streak: streak,
      best_day_minutes: bestDay.max_minutes || 0,
      completed_sessions: completedSessions,
    };
  } catch (error) {
    console.error('Error getting overall stats:', error);
    throw error;
  }
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
  try {
    const database = getDb();

    const [result] = await database.executeSql(
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
      [limit],
    );

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];

    const sessions = [];
    for (let i = 0; i < result.rows.length; i++) {
      const r = result.rows.item(i);
      sessions.push({
        date: r.date,
        displayDate:
          r.date === today
            ? 'Today'
            : r.date === yesterday
            ? 'Yesterday'
            : formatDate(r.date),
        sessions: r.sessions_count,
        duration: formatDuration(r.total_minutes),
        completed: r.all_completed === 1,
      });
    }

    return sessions;
  } catch (error) {
    console.error('Error getting recent sessions:', error);
    throw error;
  }
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============ DEV HELPERS ============

export async function seedTestData(): Promise<void> {
  try {
    const database = getDb();

    // Clear existing data
    await database.executeSql('DELETE FROM sessions');

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

        await database.executeSql(
          `INSERT INTO sessions (duration_minutes, started_at, ended_at, completed, created_at) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            duration,
            startDate.toISOString(),
            endDate.toISOString(),
            completed ? 1 : 0,
            startDate.toISOString(),
          ],
        );
      }
    }
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
}

export async function clearAllData(): Promise<void> {
  try {
    const database = getDb();
    await database.executeSql('DELETE FROM sessions');
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}

export interface GroupedSession {
  date: string;
  displayDate: string;
  totalMinutes: number;
  sessions: Session[];
}

export async function getAllSessionsGroupedByDate(): Promise<GroupedSession[]> {
  try {
    const database = getDb();

    const [result] = await database.executeSql(
      'SELECT * FROM sessions ORDER BY started_at DESC',
    );

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];

    const grouped: Map<string, GroupedSession> = new Map();

    for (let i = 0; i < result.rows.length; i++) {
      const session = result.rows.item(i);
      const date = session.started_at.split('T')[0];

      if (!grouped.has(date)) {
        let displayDate = formatDateLong(date);
        if (date === today) displayDate = 'Today';
        else if (date === yesterday) displayDate = 'Yesterday';

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
    }

    return Array.from(grouped.values());
  } catch (error) {
    console.error('Error getting all sessions grouped by date:', error);
    throw error;
  }
}

function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// =========== APP STATE ============

export const getAppState = async (): Promise<{ inUse: boolean }> => {
  try {
    const database = getDb();
    const [result] = await database.executeSql(
      'SELECT in_use FROM app_state WHERE id = 1',
    );
    const row = result.rows.length > 0 ? result.rows.item(0) : null;
    return { inUse: row ? row.in_use === 1 : false };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const setAppState = async (): Promise<boolean> => {
  try {
    const database = getDb();
    await database.executeSql(
      `
    INSERT INTO app_state (id, in_use) 
    VALUES (1, ?)
    ON CONFLICT(id) DO UPDATE SET in_use = excluded.in_use
    `,
      [1],
    );
    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
