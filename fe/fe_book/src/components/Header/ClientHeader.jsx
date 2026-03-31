import { useState } from 'react';
import { Badge, Drawer, Input } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ClientHeader.css';

const navItems = [
  { label: 'Trang Chủ', path: '/' },
  { label: 'Sản Phẩm', path: '/products' },
  { label: 'Giới Thiệu', path: '/about' },
  { label: 'Cửa Hàng', path: '/store' },
  { label: 'Liên Hệ', path: '/contact' },
];

const ClientHeader = () => {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <header className="client-header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <div className="logo-icon">📚</div>
          <span className="logo-text">Eimi Fukada</span>
        </Link>

        {/* Nav desktop */}
        <nav className="header-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="header-actions">
          {searchOpen ? (
            <div className="search-box">
              <Input
                autoFocus
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined />}
                suffix={
                  <CloseOutlined
                    className="close-search"
                    onClick={() => setSearchOpen(false)}
                  />
                }
                onPressEnter={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <button
              className="action-btn"
              onClick={() => setSearchOpen(true)}
              title="Tìm kiếm"
            >
              <SearchOutlined />
            </button>
          )}

          <Link
            to={localStorage.getItem("token") ? "/account" : "/login"}
            className="action-btn"
            title={localStorage.getItem("token") ? "Tài khoản của tôi" : "Đăng nhập"}
          >
            <UserOutlined />
          </Link>

          <Link to="/cart" className="action-btn cart-btn" title="Giỏ hàng">
            <Badge count={cartCount} size="small">
              <ShoppingCartOutlined />
            </Badge>
          </Link>

          {/* Mobile menu button */}
          <button
            className="action-btn mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
          >
            <MenuOutlined />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <Link to="/" className="header-logo" onClick={() => setMobileOpen(false)}>
            <div className="logo-icon">📚</div>
            <span className="logo-text">BookStore</span>
          </Link>
        }
        placement="left"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        width={280}
      >
        <nav className="mobile-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Drawer>
    </header>
  );
};

export default ClientHeader;