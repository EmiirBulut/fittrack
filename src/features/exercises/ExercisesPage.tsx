import { useState } from 'react';
import { Alert, Button, Col, Empty, Row, Skeleton } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PageHeader from '../../components/ui/PageHeader';
import ExerciseCard from './components/ExerciseCard';
import ExerciseDrawer from './components/ExerciseDrawer';
import { useExercises } from './hooks/useExercises';
import type { Exercise } from './types';

const ExercisesPage = () => {
  const { data: exercises, isLoading, isError } = useExercises();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | undefined>();

  const handleEdit = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setDrawerOpen(true);
  };

  const handleNew = () => {
    setSelectedExercise(undefined);
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setSelectedExercise(undefined);
  };

  return (
    <>
      <PageHeader
        title="Hareketler"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNew}>
            Yeni Hareket
          </Button>
        }
      />

      {isError && (
        <Alert
          type="error"
          message="Hareketler yüklenemedi."
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {isLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Col key={i} xs={24} sm={12} lg={8}>
              <Skeleton active />
            </Col>
          ))}
        </Row>
      ) : exercises && exercises.length > 0 ? (
        <Row gutter={[16, 16]}>
          {exercises.map((exercise) => (
            <Col key={exercise.id} xs={24} sm={12} lg={8}>
              <ExerciseCard exercise={exercise} onEdit={handleEdit} />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          description="Henüz hareket eklenmedi"
          style={{ marginTop: 64 }}
        >
          <Button type="primary" onClick={handleNew}>
            İlk Hareketi Ekle
          </Button>
        </Empty>
      )}

      <ExerciseDrawer
        open={drawerOpen}
        exercise={selectedExercise}
        onClose={handleClose}
      />
    </>
  );
};

export default ExercisesPage;
