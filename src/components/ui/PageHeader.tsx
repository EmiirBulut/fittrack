import { Flex, Typography } from 'antd';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

const PageHeader = ({ title, subtitle, extra }: Props) => {
  return (
    <Flex justify="space-between" align="flex-start" style={{ marginBottom: 24 }}>
      <Flex vertical gap={4}>
        <Typography.Title
          level={2}
          className="display-font"
          style={{ margin: 0 }}
        >
          {title}
        </Typography.Title>
        {subtitle && (
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        )}
      </Flex>
      {extra && <div>{extra}</div>}
    </Flex>
  );
};

export default PageHeader;
