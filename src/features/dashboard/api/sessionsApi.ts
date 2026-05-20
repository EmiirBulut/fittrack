import { supabase } from '../../../lib/supabase';
import type { WorkoutSessionWithWorkout } from '../../../types/workout';

export async function getWorkoutSessions(): Promise<WorkoutSessionWithWorkout[]> {
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*, workout:workouts(name)')
    .gte('completed_at', since.toISOString())
    .order('completed_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as WorkoutSessionWithWorkout[];
}
