import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#475949',
    colorBgBase: '#fafaf5',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f4f4ef',
    borderRadius: 8,
    borderRadiusLG: 12,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  components: {
    Layout: {
      siderBg: '#ffffff',
      bodyBg: '#f4f4ef',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#e8ede8',
      itemSelectedColor: '#475949',
      itemHoverBg: '#f0f4f0',
    },
    Card: {
      borderRadiusLG: 12,
    },
    Button: {
      borderRadius: 8,
    },
  },
};
