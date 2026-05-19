import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Alert, Button, Flex, Input, message, Spin, Typography } from 'antd';
import PageHeader from '../../components/ui/PageHeader';
import WorkoutStepItem from './components/WorkoutStepItem';
import AddStepButtons from './components/AddStepButtons';
import { useCreateWorkout, useUpdateWorkout, useWorkoutWithSteps } from './hooks/useWorkouts';
import { ROUTES } from '../../router/routes';
import type { WorkoutStepDraft } from './types';

const WorkoutBuilderPage = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const isEditing = !!workoutId;

  const { data: existingWorkout, isLoading } = useWorkoutWithSteps(workoutId ?? '');
  const createMutation = useCreateWorkout();
  const updateMutation = useUpdateWorkout();

  const [workoutName, setWorkoutName] = useState('');
  const [steps, setSteps] = useState<WorkoutStepDraft[]>([]);

  useEffect(() => {
    if (existingWorkout) {
      setWorkoutName(existingWorkout.name);
      setSteps(
        existingWorkout.steps.map((s) => ({
          tempId: s.id,
          exercise_id: s.exercise_id,
          step_type: s.step_type,
          duration_seconds: s.duration_seconds,
          reps: s.reps,
          tracking_type: s.tracking_type,
          exercise: s.exercise,
        })),
      );
    }
  }, [existingWorkout]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSteps((prev) => {
        const oldIndex = prev.findIndex((s) => s.tempId === active.id);
        const newIndex = prev.findIndex((s) => s.tempId === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleDeleteStep = (tempId: string) => {
    setSteps((prev) => prev.filter((s) => s.tempId !== tempId));
  };

  const handleSave = async () => {
    if (!workoutName.trim()) {
      message.error('Antrenman adı zorunludur');
      return;
    }

    if (isEditing && workoutId) {
      await updateMutation.mutateAsync({ id: workoutId, name: workoutName, steps });
    } else {
      await createMutation.mutateAsync({ name: workoutName, steps });
    }
    navigate(ROUTES.WORKOUTS);
  };

  if (isEditing && isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 300 }}>
        <Spin size="large" />
      </Flex>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const saveError = createMutation.error ?? updateMutation.error;

  return (
    <>
      <PageHeader title={isEditing ? 'Antrenmanı Düzenle' : 'Yeni Antrenman'} />

      {saveError && (
        <Alert
          type="error"
          message="Kaydedilemedi. Lütfen tekrar deneyin."
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Flex vertical gap={24} style={{ maxWidth: 640 }}>
        <div>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            Antrenman Adı
          </Typography.Text>
          <Input
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Antrenmanınıza bir isim verin"
            size="large"
            className="display-font"
            style={{ fontSize: 20 }}
          />
        </div>

        <div>
          <Typography.Text
            strong
            style={{ display: 'block', marginBottom: 12, fontSize: 15 }}
          >
            Adımlar
          </Typography.Text>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={steps.map((s) => s.tempId)}
              strategy={verticalListSortingStrategy}
            >
              {steps.map((step) => (
                <WorkoutStepItem
                  key={step.tempId}
                  step={step}
                  onDelete={handleDeleteStep}
                />
              ))}
            </SortableContext>
          </DndContext>

          {steps.length === 0 && (
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Henüz adım eklenmedi. Aşağıdan hareket veya dinlenme ekleyin.
            </Typography.Text>
          )}

          <AddStepButtons onAddStep={(step) => setSteps((prev) => [...prev, step])} />
        </div>

        <Flex justify="flex-end" gap={8}>
          <Button onClick={() => navigate(ROUTES.WORKOUTS)}>İptal</Button>
          <Button type="primary" loading={isSaving} onClick={handleSave}>
            Kaydet
          </Button>
        </Flex>
      </Flex>
    </>
  );
};

export default WorkoutBuilderPage;
