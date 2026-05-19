import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Flex, Menu, Typography } from 'antd';
import {
  HomeOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../router/routes';

const menuItems = [
  { key: ROUTES.DASHBOARD, icon: <HomeOutlined />, label: 'Dashboard' },
  { key: ROUTES.EXERCISES, icon: <ThunderboltOutlined />, label: 'Hareketler' },
  { key: ROUTES.WORKOUTS, icon: <PlayCircleOutlined />, label: 'Antrenmanlar' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <Flex
      vertical
      style={{ height: '100%', padding: '24px 0' }}
      justify="space-between"
    >
      <div>
        <Flex vertical align="center" style={{ marginBottom: 32, padding: '0 16px' }}>
          <Typography.Title
            level={4}
            className="display-font"
            style={{ margin: 0, color: '#475949', fontSize: 18 }}
          >
            FitTrack
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{ fontSize: 11, marginTop: 2 }}
          >
            Antrenman Takibi
          </Typography.Text>
        </Flex>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none' }}
        />
      </div>
      <Flex
        vertical
        gap={8}
        style={{ padding: '0 16px', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}
      >
        {user && (
          <Typography.Text
            type="secondary"
            style={{ fontSize: 12, wordBreak: 'break-all' }}
          >
            {user.email}
          </Typography.Text>
        )}
        <Button
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          type="text"
          style={{ textAlign: 'left', paddingLeft: 0 }}
        >
          Çıkış Yap
        </Button>
      </Flex>
    </Flex>
  );
};

export default Sidebar;
