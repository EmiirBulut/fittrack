import { Card, List, Typography } from 'antd';
import type { WorkoutSession } from '../../../types/workout';

interface Props {
  sessions: WorkoutSession[];
  isLoading?: boolean;
}

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
  });
};

const RecentActivity = ({ sessions, isLoading }: Props) => {
  const recent = sessions.slice(0, 5);

  return (
    <Card bordered={false} title="Son Aktivite" loading={isLoading}>
      {recent.length === 0 ? (
        <Typography.Text type="secondary">
          Henüz antrenman tamamlanmadı. Hadi başlayalım! 💪
        </Typography.Text>
      ) : (
        <List
          dataSource={recent}
          renderItem={(session) => (
            <List.Item
              extra={
                <Typography.Text type="secondary">
                  {formatDuration(session.duration_seconds)}
                </Typography.Text>
              }
            >
              <List.Item.Meta
                title={<Typography.Text strong>Antrenman</Typography.Text>}
                description={formatDate(session.completed_at)}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default RecentActivity;
