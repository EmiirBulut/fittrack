import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => {
  const location = useLocation();
  const isActiveWorkout = location.pathname.includes('/start');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isActiveWorkout && (
        <Layout.Sider
          width={220}
          breakpoint="md"
          collapsedWidth={0}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            backgroundColor: '#ffffff',
            boxShadow: '1px 0 0 #f0f0f0',
          }}
        >
          <Sidebar />
        </Layout.Sider>
      )}
      <Layout style={{ marginLeft: isActiveWorkout ? 0 : 220 }}>
        <Layout.Content
          style={{
            padding: isActiveWorkout ? 0 : 40,
            minHeight: '100vh',
            backgroundColor: '#f4f4ef',
          }}
        >
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
