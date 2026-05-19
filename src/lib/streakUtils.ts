import type { WorkoutSession } from '../types/workout';

export interface WorkoutStats {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  thisWeekSessions: number;
}

export function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const uniqueDays = Array.from(
    new Set(
      completedDates.map((d) => new Date(d).toLocaleDateString()),
    ),
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const today = new Date().toLocaleDateString();
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateStats(sessions: WorkoutSession[]): WorkoutStats {
  const completedDates = sessions.map((s) => s.completed_at);
  const currentStreak = calculateStreak(completedDates);

  const uniqueDaysAll = Array.from(
    new Set(completedDates.map((d) => new Date(d).toLocaleDateString())),
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let longestStreak = 0;
  let runningStreak = 0;
  for (let i = 0; i < uniqueDaysAll.length; i++) {
    if (i === 0) {
      runningStreak = 1;
    } else {
      const prev = new Date(uniqueDaysAll[i - 1]);
      const curr = new Date(uniqueDaysAll[i]);
      const diffDays = Math.round(
        (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays === 1) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) longestStreak = runningStreak;
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const thisWeekSessions = sessions.filter(
    (s) => new Date(s.completed_at) >= weekStart,
  ).length;

  return {
    currentStreak,
    longestStreak,
    totalSessions: sessions.length,
    thisWeekSessions,
  };
}
