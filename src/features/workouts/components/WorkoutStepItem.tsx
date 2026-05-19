import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Flex, Tag, Typography } from 'antd';
import { DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import type { WorkoutStepDraft } from '../types';

interface Props {
  step: WorkoutStepDraft;
  onDelete: (tempId: string) => void;
}

const WorkoutStepItem = ({ step, onDelete }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step.tempId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const label =
    step.step_type === 'rest'
      ? 'Dinlenme'
      : step.exercise?.name ?? 'Hareket';

  const detail =
    step.step_type === 'rest'
      ? `${step.duration_seconds ?? 0} sn`
      : step.tracking_type === 'reps'
      ? `${step.reps ?? 0} tekrar`
      : `${step.duration_seconds ?? 0} sn`;

  return (
    <div ref={setNodeRef} style={style}>
      <Flex
        align="center"
        gap={12}
        style={{
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderRadius: 8,
          marginBottom: 8,
          border: '1px solid #f0f0f0',
        }}
      >
        <span
          {...attributes}
          {...listeners}
          style={{ cursor: 'grab', color: '#b0b0b0', fontSize: 16 }}
        >
          <HolderOutlined />
        </span>

        <Tag
          color={step.step_type === 'rest' ? 'orange' : 'blue'}
          style={{ margin: 0 }}
        >
          {step.step_type === 'rest' ? 'Dinlenme' : 'Hareket'}
        </Tag>

        <Flex vertical gap={2} style={{ flex: 1 }}>
          <Typography.Text strong style={{ fontSize: 14 }}>
            {label}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {detail}
          </Typography.Text>
        </Flex>

        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(step.tempId)}
          size="small"
        />
      </Flex>
    </div>
  );
};

export default WorkoutStepItem;
