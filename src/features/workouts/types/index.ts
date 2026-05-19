import type { Exercise } from '../../exercises/types';

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface WorkoutStep {
  id: string;
  workout_id: string;
  exercise_id: string | null;
  step_type: 'exercise' | 'rest';
  order_index: number;
  duration_seconds: number | null;
  reps: number | null;
  tracking_type: 'duration' | 'reps';
  exercise?: Exercise;
}

export interface WorkoutWithSteps extends Workout {
  steps: WorkoutStep[];
}

export interface WorkoutStepDraft {
  tempId: string;
  exercise_id: string | null;
  step_type: 'exercise' | 'rest';
  duration_seconds: number | null;
  reps: number | null;
  tracking_type: 'duration' | 'reps';
  exercise?: Exercise;
}
