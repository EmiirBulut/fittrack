import { create } from 'zustand';
import type { WorkoutStep, WorkoutWithSteps } from '../features/workouts/types';

type WorkoutStatus = 'idle' | 'running' | 'paused' | 'completed';

interface ActiveWorkoutState {
  workoutId: string | null;
  workoutName: string;
  steps: WorkoutStep[];
  currentStepIndex: number;
  status: WorkoutStatus;
  elapsedSeconds: number;
  stepElapsedSeconds: number;

  startWorkout: (workout: WorkoutWithSteps) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  completeStep: () => void;
  completeWorkout: () => void;
  resetWorkout: () => void;
  tickSecond: () => void;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set, get) => ({
  workoutId: null,
  workoutName: '',
  steps: [],
  currentStepIndex: 0,
  status: 'idle',
  elapsedSeconds: 0,
  stepElapsedSeconds: 0,

  startWorkout: (workout) =>
    set({
      workoutId: workout.id,
      workoutName: workout.name,
      steps: workout.steps,
      currentStepIndex: 0,
      status: 'running',
      elapsedSeconds: 0,
      stepElapsedSeconds: 0,
    }),

  pauseWorkout: () => set({ status: 'paused' }),
  resumeWorkout: () => set({ status: 'running' }),

  completeStep: () => {
    const { currentStepIndex, steps } = get();
    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= steps.length) {
      set({ status: 'completed' });
    } else {
      set({ currentStepIndex: nextIndex, stepElapsedSeconds: 0 });
    }
  },

  completeWorkout: () => set({ status: 'completed' }),

  resetWorkout: () =>
    set({
      workoutId: null,
      workoutName: '',
      steps: [],
      currentStepIndex: 0,
      status: 'idle',
      elapsedSeconds: 0,
      stepElapsedSeconds: 0,
    }),

  tickSecond: () => {
    const { status, stepElapsedSeconds, steps, currentStepIndex, completeStep } = get();
    if (status !== 'running') return;

    const newElapsed = get().elapsedSeconds + 1;
    const newStepElapsed = stepElapsedSeconds + 1;

    const currentStep = steps[currentStepIndex];
    const isDurationStep =
      currentStep &&
      (currentStep.step_type === 'rest' || currentStep.tracking_type === 'duration');

    if (
      isDurationStep &&
      currentStep.duration_seconds !== null &&
      newStepElapsed >= currentStep.duration_seconds
    ) {
      set({ elapsedSeconds: newElapsed, stepElapsedSeconds: newStepElapsed });
      completeStep();
    } else {
      set({ elapsedSeconds: newElapsed, stepElapsedSeconds: newStepElapsed });
    }
  },
}));
