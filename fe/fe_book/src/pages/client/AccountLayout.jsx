import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  LockOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import './AccountLayout.css';

const menuItems = [
  {
    key: 'orders',
    label: 'Đơn hàng đã mua',
    icon: <ShoppingOutlined />,
    path: '/account/orders',
  },
  {
    key: 'account',
    label: 'Tài khoản của tôi',
    icon: <UserOutlined />,
    children: [
      { key: 'profile', label: 'Hồ sơ & Địa chỉ', icon: <IdcardOutlined />, path: '/account/profile' },
      { key: 'password', label: 'Đổi mật khẩu', icon: <LockOutlined />, path: '/account/password' },
    ],
  },
];

const mockUser = {
  name: 'Nguyễn Văn Khánh',
  phone: '0987 654 321',
  email: 'khanhnguyen@email.com',
  avatar: null,
};

const AccountLayout = () => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState('account');

  const isActive = (path) => location.pathname === path;

  const toggleMenu = (key) => {
    setExpandedMenu((prev) => (prev === key ? '' : key));
  };

  return (
    <div className="account-layout">

      <aside className="account-sidebar">
        <div className="sidebar-user">
          <div className="user-avatar">
            {mockUser.avatar ? (
              <img src={mockUser.avatar} alt="avatar" />
            ) : (
              <span className="avatar-fallback">{mockUser.name[0]}</span>
            )}
          </div>
          <div className="user-meta">
            <h3 className="user-name">{mockUser.name}</h3>
            <p className="user-phone">{mockUser.phone}</p>
            <p className="user-email">{mockUser.email}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) =>
            item.children ? (
              <div key={item.key} className="nav-group">
                <button
                  className={`nav-group-title ${expandedMenu === item.key ? 'expanded' : ''}`}
                  onClick={() => toggleMenu(item.key)}
                >
                  {item.icon} <span>{item.label}</span>
                  <span className="nav-arrow">{expandedMenu === item.key ? '▾' : '▸'}</span>
                </button>
                {expandedMenu === item.key && (
                  <div className="nav-sub-list">
                    {item.children.map((child) => (
                      <Link
                        key={child.key}
                        to={child.path}
                        className={`nav-sub-item ${isActive(child.path) ? 'active' : ''}`}
                      >
                        {child.icon} <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.key}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.icon} <span>{item.label}</span>
              </Link>
            )
          )}
        </nav>
      </aside>

      <main className="account-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AccountLayout;
