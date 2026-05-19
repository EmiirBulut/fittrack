import { Alert, Button, Col, Empty, Row, Skeleton } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import WorkoutCard from './components/WorkoutCard';
import { useWorkouts } from './hooks/useWorkouts';
import { useWorkoutWithSteps } from './hooks/useWorkouts';
import { ROUTES } from '../../router/routes';
import type { Workout } from './types';

const WorkoutCardWrapper = ({ workout }: { workout: Workout }) => {
  const { data, isLoading } = useWorkoutWithSteps(workout.id);
  if (isLoading) return <Skeleton active />;
  if (!data) return null;
  return <WorkoutCard workout={data} />;
};

const WorkoutsPage = () => {
  const navigate = useNavigate();
  const { data: workouts, isLoading, isError } = useWorkouts();

  return (
    <>
      <PageHeader
        title="Antrenmanlar"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(ROUTES.WORKOUT_NEW)}
          >
            Yeni Antrenman
          </Button>
        }
      />

      {isError && (
        <Alert
          type="error"
          message="Antrenmanlar yüklenemedi."
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {isLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Col key={i} xs={24} sm={12}>
              <Skeleton active />
            </Col>
          ))}
        </Row>
      ) : workouts && workouts.length > 0 ? (
        <Row gutter={[16, 16]}>
          {workouts.map((workout) => (
            <Col key={workout.id} xs={24} sm={12} lg={8}>
              <WorkoutCardWrapper workout={workout} />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          description="Henüz antrenman oluşturulmadı"
          style={{ marginTop: 64 }}
        >
          <Button type="primary" onClick={() => navigate(ROUTES.WORKOUT_NEW)}>
            İlk Antrenmanı Oluştur
          </Button>
        </Empty>
      )}
    </>
  );
};

export default WorkoutsPage;
