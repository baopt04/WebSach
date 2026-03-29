import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  ShoppingOutlined,
  LockOutlined,
  LogoutOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { Modal, message } from 'antd';
import './AccountLayout.css';

const { confirm } = Modal;

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
      {
        key: 'profile',
        label: 'Hồ sơ & Địa chỉ',
        icon: <IdcardOutlined />,
        path: '/account/profile',
      },
      {
        key: 'password',
        label: 'Đổi mật khẩu',
        icon: <LockOutlined />,
        path: '/account/password',
      },
    ],
  },
  {
    key: 'logout',
    label: 'Đăng xuất',
    icon: <LogoutOutlined />,
    isLogout: true,
  },
];

const mockUser = {
  name: localStorage.getItem("hoTen") || "Chưa cập nhật",
  phone: localStorage.getItem("soDienThoai") || "Chưa cập nhật",
  email: localStorage.getItem("email") || "Chưa cập nhật",
  avatar: null,
};

const AccountLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState('account');

  const isActive = (path) => location.pathname === path;

  const toggleMenu = (key) => {
    setExpandedMenu((prev) => (prev === key ? '' : key));
  };


  const handleLogout = () => {
    confirm({
      title: 'Xác nhận đăng xuất',
      content: 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
      okText: 'Đăng xuất',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk() {
        localStorage.clear();
        message.success('Đăng xuất thành công');
        navigate('/login');
      },
    });
  };

  return (
    <div className="account-layout">
      <aside className="account-sidebar">
        <div className="sidebar-user">
          <div className="user-avatar">
            {mockUser.avatar ? (
              <img src={mockUser.avatar} alt="avatar" />
            ) : (
              <span className="avatar-fallback">
                {mockUser.name[0]}
              </span>
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
                  className={`nav-group-title ${expandedMenu === item.key ? 'expanded' : ''
                    }`}
                  onClick={() => toggleMenu(item.key)}
                >
                  {item.icon} <span>{item.label}</span>
                  <span className="nav-arrow">
                    {expandedMenu === item.key ? '▾' : '▸'}
                  </span>
                </button>

                {expandedMenu === item.key && (
                  <div className="nav-sub-list">
                    {item.children.map((child) => (
                      <Link
                        key={child.key}
                        to={child.path}
                        className={`nav-sub-item ${isActive(child.path) ? 'active' : ''
                          }`}
                      >
                        {child.icon} <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : item.isLogout ? (
              // ✅ Logout item
              <div
                key={item.key}
                className="nav-item logout-item"
                onClick={handleLogout}
              >
                <span className="logout-text">
                  {item.icon} <span>{item.label}</span>
                </span>
              </div>
            ) : (
              <Link
                key={item.key}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''
                  }`}
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