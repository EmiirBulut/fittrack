import { Drawer } from 'antd';
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

  const handleSubmit = async (values: ExerciseFormValues) => {
    if (exercise) {
      await updateMutation.mutateAsync({ id: exercise.id, values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onClose();
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
