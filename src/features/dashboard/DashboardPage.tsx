import { Button, Flex } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import StreakCard from './components/StreakCard';
import StatsGrid from './components/StatsGrid';
import RecentActivity from './components/RecentActivity';
import { useDashboardStats, useWorkoutSessions } from './hooks/useDashboard';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../router/routes';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { stats, isLoading } = useDashboardStats();
  const { data: sessions = [] } = useWorkoutSessions();

  return (
    <Flex vertical gap={24}>
      <PageHeader
        title="Merhaba 👋"
        subtitle={user?.email}
        extra={
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            size="large"
            onClick={() => navigate(ROUTES.WORKOUTS)}
          >
            Antrenman Başlat
          </Button>
        }
      />

      <StreakCard stats={stats} isLoading={isLoading} />
      <StatsGrid stats={stats} isLoading={isLoading} />
      <RecentActivity sessions={sessions} isLoading={isLoading} />
    </Flex>
  );
};

export default DashboardPage;
