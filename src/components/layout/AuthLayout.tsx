import { Card, Flex, Typography } from 'antd';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const AuthLayout = ({ children }: Props) => {
  return (
    <Flex
      justify="center"
      align="center"
      style={{ minHeight: '100vh', backgroundColor: '#f4f4ef' }}
    >
      <Card
        bordered={false}
        style={{ width: 420, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}
      >
        <Flex vertical align="center" gap={4} style={{ marginBottom: 32 }}>
          <Typography.Title
            level={2}
            className="display-font"
            style={{ margin: 0, color: '#475949' }}
          >
            FitTrack
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Antrenman Takibi
          </Typography.Text>
        </Flex>
        {children}
      </Card>
    </Flex>
  );
};

export default AuthLayout;
