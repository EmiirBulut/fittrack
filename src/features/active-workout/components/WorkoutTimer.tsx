import { Button, Flex, Progress, Typography } from 'antd';
import type { WorkoutStep } from '../../workouts/types';

interface Props {
  step: WorkoutStep;
  stepElapsedSeconds: number;
  onComplete: () => void;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const WorkoutTimer = ({ step, stepElapsedSeconds, onComplete }: Props) => {
  if (step.step_type === 'rest' || step.tracking_type === 'duration') {
    const total = step.duration_seconds ?? 0;
    const remaining = Math.max(0, total - stepElapsedSeconds);
    const percent = total > 0 ? Math.round((stepElapsedSeconds / total) * 100) : 0;

    const strokeColor =
      remaining <= 5
        ? '#ff4d4f'
        : remaining <= 10
        ? '#faad14'
        : '#475949';

    return (
      <Flex vertical align="center" gap={24}>
        <Progress
          type="circle"
          percent={percent}
          strokeColor={strokeColor}
          size={200}
          format={() => (
            <Typography.Title
              level={2}
              className="display-font"
              style={{ margin: 0, color: strokeColor }}
            >
              {formatTime(remaining)}
            </Typography.Title>
          )}
        />
        <Typography.Text type="secondary">
          {step.step_type === 'rest' ? 'Dinlenme süresi' : 'Kalan süre'}
        </Typography.Text>
      </Flex>
    );
  }

  return (
    <Flex vertical align="center" gap={24}>
      <Typography.Title
        level={1}
        className="display-font"
        style={{ margin: 0, fontSize: 80, color: '#475949' }}
      >
        {step.reps ?? 0}
      </Typography.Title>
      <Typography.Text type="secondary" style={{ fontSize: 16 }}>
        tekrar
      </Typography.Text>
      <Button
        type="primary"
        size="large"
        onClick={onComplete}
        style={{ minWidth: 200, height: 48 }}
      >
        Tamamlandı
      </Button>
    </Flex>
  );
};

export default WorkoutTimer;
