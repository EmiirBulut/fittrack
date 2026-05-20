import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../lib/queryKeys';
import { getWorkoutSessions } from '../api/sessionsApi';
import { calculateStats } from '../../../lib/streakUtils';
import type { WorkoutSessionWithWorkout } from '../../../types/workout';

export function useWorkoutSessions() {
  return useQuery<WorkoutSessionWithWorkout[]>({
    queryKey: QUERY_KEYS.WORKOUT_SESSIONS,
    queryFn: getWorkoutSessions,
  });
}

export function useDashboardStats() {
  const { data: sessions = [], ...rest } = useWorkoutSessions();
  const stats = calculateStats(sessions);
  return { ...rest, stats };
}
