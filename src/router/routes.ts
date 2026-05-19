export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  EXERCISES: '/exercises',
  WORKOUTS: '/workouts',
  WORKOUT_NEW: '/workouts/new',
  WORKOUT_EDIT: (id: string) => `/workouts/${id}/edit`,
  WORKOUT_START: (id: string) => `/workouts/${id}/start`,
} as const;
