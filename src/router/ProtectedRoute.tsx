import { Navigate, Outlet } from 'react-router-dom';
import { Flex, Spin } from 'antd';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from './routes';

const ProtectedRoute = () => {
  const { session, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (!session) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
