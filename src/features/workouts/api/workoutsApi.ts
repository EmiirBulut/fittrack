import { supabase } from '../../../lib/supabase';
import type { Workout, WorkoutStep, WorkoutStepDraft, WorkoutWithSteps } from '../types';

export async function getWorkouts(): Promise<Workout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Workout[];
}

export async function getWorkoutWithSteps(id: string): Promise<WorkoutWithSteps> {
  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', id)
    .single();

  if (workoutError) throw new Error(workoutError.message);

  const { data: steps, error: stepsError } = await supabase
    .from('workout_steps')
    .select('*, exercise:exercises(*)')
    .eq('workout_id', id)
    .order('order_index', { ascending: true });

  if (stepsError) throw new Error(stepsError.message);

  return { ...(workout as Workout), steps: (steps ?? []) as WorkoutStep[] };
}

export async function createWorkout(
  name: string,
  stepDrafts: WorkoutStepDraft[],
): Promise<Workout> {
  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .insert({ name })
    .select()
    .single();

  if (workoutError) throw new Error(workoutError.message);

  if (stepDrafts.length > 0) {
    const stepsToInsert = stepDrafts.map((s, index) => ({
      workout_id: (workout as Workout).id,
      exercise_id: s.exercise_id,
      step_type: s.step_type,
      order_index: index,
      duration_seconds: s.duration_seconds,
      reps: s.reps,
      tracking_type: s.tracking_type,
    }));

    const { error: stepsError } = await supabase
      .from('workout_steps')
      .insert(stepsToInsert);

    if (stepsError) throw new Error(stepsError.message);
  }

  return workout as Workout;
}

export async function updateWorkout(
  id: string,
  name: string,
  stepDrafts: WorkoutStepDraft[],
): Promise<void> {
  const { error: workoutError } = await supabase
    .from('workouts')
    .update({ name })
    .eq('id', id);

  if (workoutError) throw new Error(workoutError.message);

  const { error: deleteError } = await supabase
    .from('workout_steps')
    .delete()
    .eq('workout_id', id);

  if (deleteError) throw new Error(deleteError.message);

  if (stepDrafts.length > 0) {
    const stepsToInsert = stepDrafts.map((s, index) => ({
      workout_id: id,
      exercise_id: s.exercise_id,
      step_type: s.step_type,
      order_index: index,
      duration_seconds: s.duration_seconds,
      reps: s.reps,
      tracking_type: s.tracking_type,
    }));

    const { error: stepsError } = await supabase
      .from('workout_steps')
      .insert(stepsToInsert);

    if (stepsError) throw new Error(stepsError.message);
  }
}

export async function deleteWorkout(id: string): Promise<void> {
  const { error } = await supabase.from('workouts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
