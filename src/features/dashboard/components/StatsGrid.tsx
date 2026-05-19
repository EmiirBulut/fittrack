import { Card, Col, Row, Statistic } from 'antd';
import { CalendarOutlined, ThunderboltOutlined, TrophyOutlined } from '@ant-design/icons';
import { useExercises } from '../../exercises/hooks/useExercises';
import type { WorkoutStats } from '../../../lib/streakUtils';

interface Props {
  stats: WorkoutStats;
  isLoading?: boolean;
}

const StatsGrid = ({ stats, isLoading }: Props) => {
  const { data: exercises } = useExercises();

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={8}>
        <Card bordered={false} loading={isLoading}>
          <Statistic
            title="Toplam Antrenman"
            value={stats.totalSessions}
            prefix={<TrophyOutlined style={{ color: '#475949' }} />}
            suffix="seans"
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card bordered={false} loading={isLoading}>
          <Statistic
            title="Bu Hafta"
            value={stats.thisWeekSessions}
            prefix={<CalendarOutlined style={{ color: '#475949' }} />}
            suffix="antrenman"
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card bordered={false}>
          <Statistic
            title="Toplam Hareket"
            value={exercises?.length ?? 0}
            prefix={<ThunderboltOutlined style={{ color: '#475949' }} />}
            suffix="hareket"
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StatsGrid;
