import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../lib/queryKeys';
import {
  createExercise,
  deleteExercise,
  getExercises,
  updateExercise,
} from '../api/exercisesApi';
import type { ExerciseFormValues } from '../types';

export function useExercises() {
  return useQuery({
    queryKey: QUERY_KEYS.EXERCISES,
    queryFn: getExercises,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ExerciseFormValues) => createExercise(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ExerciseFormValues }) =>
      updateExercise(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES });
    },
  });
}
