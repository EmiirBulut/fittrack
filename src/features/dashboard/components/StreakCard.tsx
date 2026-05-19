import { Card, Flex, Typography } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import type { WorkoutStats } from '../../../lib/streakUtils';

interface Props {
  stats: WorkoutStats;
  isLoading?: boolean;
}

const StreakCard = ({ stats, isLoading }: Props) => {
  const hasStreak = stats.currentStreak > 0;

  return (
    <Card bordered={false} loading={isLoading}>
      <Flex align="center" gap={24}>
        <FireOutlined
          style={{
            fontSize: 48,
            color: hasStreak ? '#ff6b35' : '#d0d0d0',
          }}
        />
        <Flex vertical gap={4}>
          <Flex align="baseline" gap={8}>
            <Typography.Title
              level={1}
              className="display-font"
              style={{ margin: 0, fontSize: 56, lineHeight: 1 }}
            >
              {stats.currentStreak}
            </Typography.Title>
            <Typography.Text style={{ fontSize: 18, color: '#666' }}>
              günlük seri
            </Typography.Text>
          </Flex>
          <Typography.Text type="secondary">
            En uzun seri: {stats.longestStreak} gün
          </Typography.Text>
        </Flex>
      </Flex>
    </Card>
  );
};

export default StreakCard;
