export const QUERY_KEYS = {
  EXERCISES: ['exercises'] as const,
  EXERCISE_DETAIL: (id: string) => ['exercises', id] as const,
  WORKOUTS: ['workouts'] as const,
  WORKOUT_DETAIL: (id: string) => ['workouts', id] as const,
  WORKOUT_STEPS: (workoutId: string) => ['workout_steps', workoutId] as const,
  WORKOUT_SESSIONS: ['workout_sessions'] as const,
} as const;
