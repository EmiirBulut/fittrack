import { Steps } from 'antd';
import { CoffeeOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { WorkoutStep } from '../../workouts/types';

interface Props {
  steps: WorkoutStep[];
  currentStepIndex: number;
}

const StepProgressBar = ({ steps, currentStepIndex }: Props) => {
  const items = steps.map((step, index) => {
    let status: 'finish' | 'process' | 'wait' = 'wait';
    if (index < currentStepIndex) status = 'finish';
    else if (index === currentStepIndex) status = 'process';

    return {
      title: step.step_type === 'rest' ? 'Dinlenme' : (step.exercise?.name ?? 'Hareket'),
      status,
      icon: step.step_type === 'rest' ? <CoffeeOutlined /> : <ThunderboltOutlined />,
    };
  });

  return (
    <Steps
      items={items}
      size="small"
      style={{ padding: '16px 24px' }}
    />
  );
};

export default StepProgressBar;
