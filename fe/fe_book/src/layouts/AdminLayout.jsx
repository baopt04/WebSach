import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Typography, Breadcrumb } from 'antd';
import {
  DashboardOutlined,
  BookOutlined,
  TagOutlined,
  FileTextOutlined,
  UserOutlined,
  EditOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from '@ant-design/icons';
import './AdminLayout.css';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/admin/products', icon: <BookOutlined />, label: 'Sản phẩm' },
  { key: '/admin/coupons', icon: <TagOutlined />, label: 'Mã giảm giá' },
  { key: '/admin/orders', icon: <FileTextOutlined />, label: 'Hóa đơn' },
  { key: '/admin/accounts', icon: <UserOutlined />, label: 'Tài khoản' },
  { key: '/admin/authors', icon: <EditOutlined />, label: 'Tác giả' },
  { key: '/admin/categories', icon: <AppstoreOutlined />, label: 'Thể loại' },
  { key: '/admin/statistics', icon: <BarChartOutlined />, label: 'Thống kê' },
  { key: '/admin/pos', icon: <ShoppingCartOutlined />, label: 'Bán hàng tại quầy' },
];

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Quản lý Sản phẩm',
  '/admin/coupons': 'Quản lý Mã giảm giá',
  '/admin/orders': 'Quản lý Hóa đơn',
  '/admin/accounts': 'Quản lý Tài khoản',
  '/admin/authors': 'Quản lý Tác giả',
  '/admin/categories': 'Quản lý Thể loại',
  '/admin/statistics': 'Báo cáo Thống kê',
  '/admin/pos': 'Bán hàng tại quầy',
};

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const activeMenuKey = menuItems.find(item => currentPath === item.key || currentPath.startsWith(item.key + '/'))?.key || currentPath;
  const pageTitle = pageTitles[activeMenuKey] || 'Admin';

  const dropdownItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout className="admin-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={240}
        collapsedWidth={64}
        className="admin-sider"
      >
        <div className="admin-logo">
          <BookOutlined className="admin-logo-icon" />
          {!collapsed && <span className="admin-logo-text">BookAdmin</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeMenuKey]}
          items={menuItems}
          onClick={handleMenuClick}
          className="admin-menu"
        />
      </Sider>

      <Layout className="admin-main" style={{ marginLeft: collapsed ? 64 : 240 }}>
        <Header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            <Breadcrumb
              items={[
                { title: 'Admin' },
                { title: pageTitle },
              ]}
              className="admin-breadcrumb"
            />
          </div>
          <div className="admin-header-right">
            <button className="admin-header-icon-btn">
              <BellOutlined />
            </button>
            <Dropdown
              menu={{
                items: dropdownItems,
                onClick: ({ key }) => {
                  if (key === 'logout') navigate('/login');
                },
              }}
              placement="bottomRight"
              arrow
            >
              <div className="admin-avatar-wrap">
                <Avatar icon={<UserOutlined />} className="admin-avatar" />
                {!collapsed && <Text className="admin-username">Admin</Text>}
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="admin-content">
          <div className="admin-content-inner">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
