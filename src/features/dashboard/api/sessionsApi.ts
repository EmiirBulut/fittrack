import { supabase } from '../../../lib/supabase';
import type { WorkoutSession } from '../../../types/workout';

export async function getWorkoutSessions(): Promise<WorkoutSession[]> {
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .gte('completed_at', since.toISOString())
    .order('completed_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as WorkoutSession[];
}
