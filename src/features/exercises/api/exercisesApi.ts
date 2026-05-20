import { supabase } from '../../../lib/supabase';
import type { Exercise, ExerciseFormValues } from '../types';

export async function getExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Exercise[];
}

export async function createExercise(values: ExerciseFormValues): Promise<Exercise> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Kullanıcı oturumu bulunamadı');

  const { data, error } = await supabase
    .from('exercises')
    .insert({ ...values, user_id: session.user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Exercise;
}

export async function updateExercise(
  id: string,
  values: ExerciseFormValues,
): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .update(values)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Exercise;
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase.from('exercises').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
