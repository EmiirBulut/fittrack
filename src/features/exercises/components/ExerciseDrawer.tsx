import { useState } from 'react';
import { Alert, Drawer } from 'antd';
import ExerciseForm from './ExerciseForm';
import { useCreateExercise, useUpdateExercise } from '../hooks/useExercises';
import type { Exercise, ExerciseFormValues } from '../types';

interface Props {
  open: boolean;
  exercise?: Exercise;
  onClose: () => void;
}

const ExerciseDrawer = ({ open, exercise, onClose }: Props) => {
  const createMutation = useCreateExercise();
  const updateMutation = useUpdateExercise();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: ExerciseFormValues) => {
    setErrorMessage(null);
    try {
      if (exercise) {
        await updateMutation.mutateAsync({ id: exercise.id, values });
      } else {
        await createMutation.mutateAsync(values);
      }
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Beklenmedik bir hata oluştu');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Drawer
      title={exercise ? 'Hareketi Düzenle' : 'Yeni Hareket'}
      open={open}
      onClose={onClose}
      width={480}
      destroyOnHidden
    >
      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setErrorMessage(null)}
        />
      )}
      <ExerciseForm
        exercise={exercise}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </Drawer>
  );
};

export default ExerciseDrawer;
