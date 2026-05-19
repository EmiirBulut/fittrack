import { supabase } from '../../../lib/supabase';

export interface CreateSessionParams {
  workout_id: string;
  duration_seconds: number;
}

export async function createWorkoutSession(params: CreateSessionParams): Promise<void> {
  const { error } = await supabase.from('workout_sessions').insert({
    workout_id: params.workout_id,
    duration_seconds: params.duration_seconds,
  });
  if (error) throw new Error(error.message);
}
