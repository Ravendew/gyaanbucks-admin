import {
  AppstoreOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Layout, Menu, Typography } from 'antd';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/categories', icon: <AppstoreOutlined />, label: 'Categories' },
    { key: '/quizzes', icon: <QuestionCircleOutlined />, label: 'Quizzes' },
    { key: '/blogs', icon: <FileTextOutlined />, label: 'Blogs' },
    { key: '/redeem', icon: <TrophyOutlined />, label: 'Redeem Requests' },
    { key: '/users', icon: <UserOutlined />, label: 'Users' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
    setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="admin-logo">
        <span>Gyaan</span>
        <strong>Bucks</strong>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        className="admin-menu"
        items={menuItems}
        onClick={(e) => handleMenuClick(e.key)}
      />
    </>
  );

  return (
    <Layout className="admin-shell">
      <Sider width={260} className="admin-sider">
        {sidebarContent}
      </Sider>

      <Drawer
        placement="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        width={280}
        className="admin-mobile-drawer"
        styles={{ body: { padding: 0 } }}
      >
        {sidebarContent}
      </Drawer>

      <Layout className="admin-main-layout">
        <Header className="admin-header">
          <div className="admin-header-left">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              className="admin-menu-btn"
            />

            <div>
              <Typography.Text className="admin-welcome">
                Welcome back, Admin
              </Typography.Text>
              <Typography.Title level={4} className="admin-title">
                GyaanBucks Control Center
              </Typography.Title>
            </div>
          </div>

          <div className="admin-header-actions">
            <div className="admin-status">● Backend Connected</div>

            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="admin-logout-btn"
            >
              Logout
            </Button>
          </div>
        </Header>

        <Content className="admin-content">{children}</Content>
      </Layout>
    </Layout>
  );
}
