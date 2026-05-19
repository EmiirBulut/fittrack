import { useState } from 'react';
import { Button, Flex, Input, InputNumber, Modal, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useExercises } from '../../exercises/hooks/useExercises';
import type { Exercise } from '../../exercises/types';
import type { WorkoutStepDraft } from '../types';

interface Props {
  onAddStep: (step: WorkoutStepDraft) => void;
}

const AddStepButtons = ({ onAddStep }: Props) => {
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [restModalOpen, setRestModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [restSeconds, setRestSeconds] = useState<number>(30);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [trackingType, setTrackingType] = useState<'duration' | 'reps'>('duration');
  const [durationSeconds, setDurationSeconds] = useState<number>(60);
  const [reps, setReps] = useState<number>(10);

  const { data: exercises } = useExercises();

  const filteredExercises = (exercises ?? []).filter((e) =>
    e.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleAddExercise = () => {
    if (!selectedExercise) return;
    onAddStep({
      tempId: crypto.randomUUID(),
      exercise_id: selectedExercise.id,
      step_type: 'exercise',
      tracking_type: trackingType,
      duration_seconds: trackingType === 'duration' ? durationSeconds : null,
      reps: trackingType === 'reps' ? reps : null,
      exercise: selectedExercise,
    });
    setExerciseModalOpen(false);
    setSelectedExercise(null);
    setSearchText('');
    setTrackingType('duration');
    setDurationSeconds(60);
    setReps(10);
  };

  const handleAddRest = () => {
    onAddStep({
      tempId: crypto.randomUUID(),
      exercise_id: null,
      step_type: 'rest',
      tracking_type: 'duration',
      duration_seconds: restSeconds,
      reps: null,
    });
    setRestModalOpen(false);
    setRestSeconds(30);
  };

  return (
    <>
      <Flex gap={8}>
        <Button
          icon={<PlusOutlined />}
          onClick={() => setExerciseModalOpen(true)}
        >
          Hareket Ekle
        </Button>
        <Button
          icon={<PlusOutlined />}
          onClick={() => setRestModalOpen(true)}
        >
          Dinlenme Ekle
        </Button>
      </Flex>

      <Modal
        title="Hareket Seç"
        open={exerciseModalOpen}
        onCancel={() => {
          setExerciseModalOpen(false);
          setSelectedExercise(null);
          setSearchText('');
        }}
        onOk={handleAddExercise}
        okText="Ekle"
        cancelText="İptal"
        okButtonProps={{ disabled: !selectedExercise }}
      >
        <Input
          placeholder="Hareket ara..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <div style={{ maxHeight: 240, overflowY: 'auto', marginBottom: 16 }}>
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => setSelectedExercise(exercise)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                backgroundColor:
                  selectedExercise?.id === exercise.id ? '#e8ede8' : 'transparent',
                marginBottom: 4,
              }}
            >
              <Typography.Text>{exercise.name}</Typography.Text>
            </div>
          ))}
          {filteredExercises.length === 0 && (
            <Typography.Text type="secondary">Hareket bulunamadı</Typography.Text>
          )}
        </div>

        {selectedExercise && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text strong>Takip Türü</Typography.Text>
            <Flex gap={8}>
              <Button
                type={trackingType === 'duration' ? 'primary' : 'default'}
                onClick={() => setTrackingType('duration')}
                size="small"
              >
                Süre
              </Button>
              <Button
                type={trackingType === 'reps' ? 'primary' : 'default'}
                onClick={() => setTrackingType('reps')}
                size="small"
              >
                Tekrar
              </Button>
            </Flex>
            {trackingType === 'duration' ? (
              <Flex align="center" gap={8}>
                <Typography.Text>Süre (sn):</Typography.Text>
                <InputNumber
                  min={1}
                  value={durationSeconds}
                  onChange={(v) => setDurationSeconds(v ?? 60)}
                />
              </Flex>
            ) : (
              <Flex align="center" gap={8}>
                <Typography.Text>Tekrar:</Typography.Text>
                <InputNumber
                  min={1}
                  value={reps}
                  onChange={(v) => setReps(v ?? 10)}
                />
              </Flex>
            )}
          </Space>
        )}
      </Modal>

      <Modal
        title="Dinlenme Ekle"
        open={restModalOpen}
        onCancel={() => setRestModalOpen(false)}
        onOk={handleAddRest}
        okText="Ekle"
        cancelText="İptal"
      >
        <Flex align="center" gap={8}>
          <Typography.Text>Süre (sn):</Typography.Text>
          <InputNumber
            min={1}
            value={restSeconds}
            onChange={(v) => setRestSeconds(v ?? 30)}
          />
        </Flex>
      </Modal>
    </>
  );
};

export default AddStepButtons;
