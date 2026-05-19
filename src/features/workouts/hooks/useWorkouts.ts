import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../lib/queryKeys';
import {
  createWorkout,
  deleteWorkout,
  getWorkouts,
  getWorkoutWithSteps,
  updateWorkout,
} from '../api/workoutsApi';
import type { WorkoutStepDraft } from '../types';

export function useWorkouts() {
  return useQuery({
    queryKey: QUERY_KEYS.WORKOUTS,
    queryFn: getWorkouts,
  });
}

export function useWorkoutWithSteps(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.WORKOUT_DETAIL(id),
    queryFn: () => getWorkoutWithSteps(id),
    enabled: !!id,
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, steps }: { name: string; steps: WorkoutStepDraft[] }) =>
      createWorkout(name, steps),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS });
    },
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      steps,
    }: {
      id: string;
      name: string;
      steps: WorkoutStepDraft[];
    }) => updateWorkout(id, name, steps),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.WORKOUT_DETAIL(variables.id),
      });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS });
    },
  });
}
