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
  ShopOutlined,
} from '@ant-design/icons';
import './AdminLayout.css';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/admin/dashboard', icon: <BarChartOutlined />, label: 'Thống kê' },
  { key: '/admin/pos', icon: <ShoppingCartOutlined />, label: 'Bán hàng tại quầy' },
  { key: '/admin/orders', icon: <FileTextOutlined />, label: 'Quản lý hóa đơn' },
  {
    key: 'group-products',
    icon: <AppstoreOutlined />,
    label: 'Quản lý sản phẩm',
    children: [
      { key: '/admin/products', icon: <BookOutlined />, label: 'Sản phẩm' },
      { key: '/admin/categories', icon: <AppstoreOutlined />, label: 'Thể loại' },
      { key: '/admin/publishers', icon: <ShopOutlined />, label: 'Nhà xuất bản' },
      { key: '/admin/authors', icon: <EditOutlined />, label: 'Tác giả' },
    ]
  },
  { key: '/admin/accounts', icon: <UserOutlined />, label: 'Quản lý tài khoản' },
  { key: '/admin/coupons', icon: <TagOutlined />, label: 'Giảm giá' },
];

const pageTitles = {
  '/admin/statistics': 'Báo cáo Thống kê',
  '/admin/pos': 'Bán hàng tại quầy',
  '/admin/orders': 'Quản lý Hóa đơn',
  '/admin/products': 'Quản lý Sản phẩm',
  '/admin/categories': 'Quản lý Thể loại',
  '/admin/publishers': 'Quản lý Nhà xuất bản',
  '/admin/authors': 'Quản lý Tác giả',
  '/admin/accounts': 'Quản lý Tài khoản',
  '/admin/coupons': 'Quản lý Mã giảm giá',
};

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const findActiveKey = (items, path) => {
    for (const item of items) {
      if (item.children) {
        const childMatch = findActiveKey(item.children, path);
        if (childMatch) return childMatch;
      }
      if (path === item.key || path.startsWith(item.key + '/')) {
        return item.key;
      }
    }
    return null;
  };

  const activeMenuKey = findActiveKey(menuItems, currentPath) || currentPath;
  const pageTitle = pageTitles[activeMenuKey] || 'Admin dashboard';

  const [openKeys, setOpenKeys] = useState(['group-products']);

  const handleMenuClick = ({ key }) => {
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

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
          {!collapsed && <span className="admin-logo-text">DREAM BOOK</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeMenuKey]}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={onOpenChange}
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
