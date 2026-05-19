import { useNavigate } from 'react-router-dom';
import { Button, Card, Flex, Popconfirm, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useDeleteWorkout } from '../hooks/useWorkouts';
import { ROUTES } from '../../../router/routes';
import type { WorkoutWithSteps } from '../types';

interface Props {
  workout: WorkoutWithSteps;
}

const WorkoutCard = ({ workout }: Props) => {
  const navigate = useNavigate();
  const deleteMutation = useDeleteWorkout();

  const exerciseCount = workout.steps.filter((s) => s.step_type === 'exercise').length;
  const restCount = workout.steps.filter((s) => s.step_type === 'rest').length;

  const totalSeconds = workout.steps.reduce(
    (acc, s) => acc + (s.duration_seconds ?? 0),
    0,
  );
  const totalMinutes = Math.round(totalSeconds / 60);

  return (
    <Card bordered={false}>
      <Flex vertical gap={12}>
        <Typography.Title
          level={4}
          className="display-font"
          style={{ margin: 0 }}
        >
          {workout.name}
        </Typography.Title>

        <Flex gap={8} wrap>
          {exerciseCount > 0 && <Tag color="blue">{exerciseCount} hareket</Tag>}
          {restCount > 0 && <Tag color="orange">{restCount} dinlenme</Tag>}
          {totalMinutes > 0 && (
            <Tag color="default">~{totalMinutes} dk</Tag>
          )}
        </Flex>

        <Flex gap={8} justify="flex-end">
          <Popconfirm
            title="Bu antrenmanı silmek istediğinize emin misiniz?"
            okText="Evet, Sil"
            cancelText="İptal"
            onConfirm={() => deleteMutation.mutate(workout.id)}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              type="text"
              loading={deleteMutation.isPending}
            />
          </Popconfirm>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(ROUTES.WORKOUT_EDIT(workout.id))}
          >
            Düzenle
          </Button>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => navigate(ROUTES.WORKOUT_START(workout.id))}
          >
            Başlat
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default WorkoutCard;
