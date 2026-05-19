import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Col, Flex, Row, Spin, Typography, message } from 'antd';
import { PauseOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useWorkoutTimer } from './hooks/useWorkoutTimer';
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore';
import { useWorkoutWithSteps } from '../workouts/hooks/useWorkouts';
import { createWorkoutSession } from './api/sessionsApi';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../lib/queryKeys';
import { ROUTES } from '../../router/routes';
import WorkoutTimer from './components/WorkoutTimer';
import ExerciseVideoEmbed from './components/ExerciseVideoEmbed';
import StepProgressBar from './components/StepProgressBar';

const ActiveWorkoutPage = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: workout, isLoading, isError } = useWorkoutWithSteps(workoutId ?? '');

  const {
    steps,
    currentStepIndex,
    status,
    elapsedSeconds,
    stepElapsedSeconds,
    workoutName,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    completeStep,
    resetWorkout,
  } = useActiveWorkoutStore();

  useWorkoutTimer();

  useEffect(() => {
    if (workout && status === 'idle') {
      startWorkout(workout);
    }
  }, [workout, status, startWorkout]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === 'running' || status === 'paused') {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status]);

  useEffect(() => {
    if (status === 'completed' && workoutId) {
      createWorkoutSession({
        workout_id: workoutId,
        duration_seconds: elapsedSeconds,
      })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSIONS });
          message.success('Antrenman tamamlandı! Harika iş! 💪');
          resetWorkout();
          navigate(ROUTES.WORKOUTS);
        })
        .catch(() => {
          message.error('Antrenman kaydedilemedi.');
          resetWorkout();
          navigate(ROUTES.WORKOUTS);
        });
    }
  }, [status, workoutId, elapsedSeconds, queryClient, resetWorkout, navigate]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (isError || !workout) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '100vh', padding: 24 }}>
        <Alert type="error" message="Antrenman yüklenemedi." showIcon />
      </Flex>
    );
  }

  const currentStep = steps[currentStepIndex];
  if (!currentStep) return null;

  const exercise = currentStep.exercise;

  return (
    <Flex vertical style={{ minHeight: '100vh', backgroundColor: '#f4f4ef' }}>
      <Flex
        justify="space-between"
        align="center"
        style={{
          padding: '16px 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Typography.Title
          level={4}
          className="display-font"
          style={{ margin: 0 }}
        >
          {workoutName}
        </Typography.Title>
        <Flex gap={8}>
          {status === 'running' ? (
            <Button icon={<PauseOutlined />} onClick={pauseWorkout}>
              Duraklat
            </Button>
          ) : (
            <Button icon={<PlayCircleOutlined />} onClick={resumeWorkout}>
              Devam Et
            </Button>
          )}
          <Button
            danger
            icon={<StopOutlined />}
            onClick={() => {
              resetWorkout();
              navigate(ROUTES.WORKOUTS);
            }}
          >
            Bitir
          </Button>
        </Flex>
      </Flex>

      <Row gutter={0} style={{ flex: 1 }}>
        <Col xs={24} md={12} style={{ padding: 24 }}>
          <Flex vertical gap={16}>
            <ExerciseVideoEmbed
              youtubeUrl={exercise?.youtube_url}
              imageUrl={exercise?.image_url}
            />
            <Typography.Title level={3} className="display-font" style={{ margin: 0 }}>
              {currentStep.step_type === 'rest'
                ? 'Dinlenme'
                : (exercise?.name ?? 'Hareket')}
            </Typography.Title>
            {exercise?.description && (
              <Typography.Text type="secondary">{exercise.description}</Typography.Text>
            )}
          </Flex>
        </Col>

        <Col
          xs={24}
          md={12}
          style={{
            padding: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WorkoutTimer
            step={currentStep}
            stepElapsedSeconds={stepElapsedSeconds}
            onComplete={completeStep}
          />
        </Col>
      </Row>

      <div style={{ backgroundColor: '#ffffff', borderTop: '1px solid #f0f0f0' }}>
        <StepProgressBar steps={steps} currentStepIndex={currentStepIndex} />
      </div>
    </Flex>
  );
};

export default ActiveWorkoutPage;
