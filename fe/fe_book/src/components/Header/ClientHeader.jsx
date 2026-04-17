import { useState } from 'react';
import { Badge, Drawer, Input } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  MenuOutlined,
  CloseOutlined,
  CarOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount } = useCart();

  const handleSearch = () => {
    const keyword = searchKeyword.trim();
    navigate(keyword ? `/products?keyword=${encodeURIComponent(keyword)}` : '/products');
    setSearchOpen(false);
  };

  return (
    <header className="client-header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <div className="logo-icon">📚</div>
          <span className="logo-text">DREAM BOOK</span>
        </Link>

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
        <div className="header-actions">
          {searchOpen ? (
            <div className="search-box">
              <Input
                autoFocus
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                suffix={
                  <CloseOutlined
                    className="close-search"
                    onClick={() => setSearchOpen(false)}
                  />
                }
                onPressEnter={handleSearch}
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

          <Link to="/order-tracking" className="action-btn" title="Tra cứu đơn hàng">
            <CarOutlined />
          </Link>

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

          <button
            className="action-btn mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
          >
            <MenuOutlined />
          </button>
        </div>
      </div>

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