import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Typography, Breadcrumb, Modal, Descriptions, Button, Tag, message, Input, Radio, DatePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
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
import { updateMyProfile } from '../services/client/ProfileCustomer';

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
  const pageTitle = pageTitles[activeMenuKey] || 'Thống kê';

  const [openKeys, setOpenKeys] = useState(['group-products']);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    gioiTinh: true,
    ngaySinh: null,
  });
  const [formErrors, setFormErrors] = useState({});

  const onEditProfileClick = () => {
    setIsEditingProfile(true);
    const ngaySinhStr = localStorage.getItem('ngaySinh');
    setProfileForm({
      hoTen: localStorage.getItem('hoTen') || '',
      soDienThoai: localStorage.getItem('soDienThoai') || '',
      email: localStorage.getItem('email') || '',
      gioiTinh: localStorage.getItem('gioiTinh') === 'true',
      ngaySinh: (ngaySinhStr && ngaySinhStr !== 'null')
        ? (dayjs(ngaySinhStr, ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM/DD/YYYY']).isValid()
            ? dayjs(ngaySinhStr, ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM/DD/YYYY'])
            : dayjs(ngaySinhStr).isValid() ? dayjs(ngaySinhStr) : null)
        : null,
    });
    setFormErrors({});
  };

  const validateProfile = () => {
    const errors = {};
    const cleanHoTen = profileForm.hoTen ? profileForm.hoTen.trim() : '';
    if (!cleanHoTen) {
      errors.hoTen = 'Vui lòng nhập họ tên';
    } else if (cleanHoTen.length < 5 || cleanHoTen.length > 50) {
      errors.hoTen = 'Họ tên phải từ 5 đến 50 ký tự';
    }

    const cleanPhone = profileForm.soDienThoai ? profileForm.soDienThoai.trim() : '';
    const phoneRegex = /^(0|84)(3|5|7|8|9)[0-9]{8}$/;
    if (!cleanPhone) {
      errors.soDienThoai = 'Vui lòng nhập số điện thoại';
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.soDienThoai = 'Số điện thoại không hợp lệ (VD: 0987123456)';
    }

    const cleanEmail = profileForm.email ? profileForm.email.trim() : '';
    if (!cleanEmail) {
      errors.email = 'Vui lòng nhập email';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        errors.email = 'Email không hợp lệ';
      } else if (cleanEmail.length > 255) {
        errors.email = 'Email không được vượt quá 255 ký tự';
      }
    }

    if (profileForm.gioiTinh === undefined || profileForm.gioiTinh === null) {
      errors.gioiTinh = 'Vui lòng chọn giới tính';
    }

    if (!profileForm.ngaySinh) {
      errors.ngaySinh = 'Vui lòng chọn ngày sinh';
    } else {
      const today = dayjs();
      const age = today.diff(profileForm.ngaySinh, 'year');
      if (age < 18) {
        errors.ngaySinh = 'Bạn phải đủ 18 tuổi';
      } else if (age > 100) {
        errors.ngaySinh = 'Tuổi không hợp lệ';
      }
    }

    return errors;
  };

  const handleSaveProfile = async () => {
    const errors = validateProfile();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const payload = {
      hoTen: profileForm.hoTen.trim(),
      soDienThoai: profileForm.soDienThoai.trim(),
      email: profileForm.email.trim(),
      gioiTinh: profileForm.gioiTinh,
      ngaySinh: profileForm.ngaySinh ? profileForm.ngaySinh.format('DD-MM-YYYY') : null
    };

    Modal.confirm({
      title: 'Cập nhật hồ sơ',
      content: 'Bạn có chắc chắn muốn cập nhật thông tin?',
      okText: 'Cập nhật',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await updateMyProfile(payload);

          const currentEmail = localStorage.getItem('email');
          const emailChanged = payload.email !== currentEmail;

          localStorage.setItem('hoTen', payload.hoTen);
          localStorage.setItem('soDienThoai', payload.soDienThoai);
          localStorage.setItem('email', payload.email);
          localStorage.setItem('gioiTinh', payload.gioiTinh.toString());
          localStorage.setItem('ngaySinh', payload.ngaySinh);

          message.success("Cập nhật thông tin thành công!");
          setIsEditingProfile(false);

          if (emailChanged) {
            message.info("Email đã được thay đổi. Vui lòng đăng nhập lại.");
            localStorage.clear();
            navigate('/login');
          }
        } catch (error) {
          console.log("ERROR:", error);
          message.error(error.message || "Có lỗi xảy ra khi cập nhật.");
        }
      }
    });
  };

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
                  if (key === 'profile') setProfileModalOpen(true);
                },
              }}
              placement="bottomRight"
              arrow
            >
              <div className="admin-avatar-wrap">
                <Avatar icon={<UserOutlined />} className="admin-avatar" />
                {!collapsed && <Text className="admin-username">{localStorage.getItem('hoTen') || 'Admin'}</Text>}
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

      <Modal
        title={isEditingProfile ? "Cập nhật hồ sơ" : "Thông tin hồ sơ"}
        open={profileModalOpen}
        onCancel={() => { setProfileModalOpen(false); setIsEditingProfile(false); }}
        footer={
          isEditingProfile ? [
            <Button key="cancel" onClick={() => setIsEditingProfile(false)}>Hủy</Button>,
            <Button key="save" type="primary" onClick={handleSaveProfile}>Lưu thay đổi</Button>
          ] : [
            <Button key="close" onClick={() => setProfileModalOpen(false)}>Thoát</Button>,
            <Button key="update" type="primary" onClick={onEditProfileClick}>Cập nhật thông tin</Button>
          ]
        }
      >
        {isEditingProfile ? (
          <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label>Họ và tên</label>
              <Input
                value={profileForm.hoTen}
                onChange={e => { setProfileForm({ ...profileForm, hoTen: e.target.value }); setFormErrors(prev => ({ ...prev, hoTen: '' })); }}
                placeholder="Họ và tên"
              />
              {formErrors.hoTen && <div style={{ color: 'red', marginTop: '4px' }}>{formErrors.hoTen}</div>}
            </div>
            <div>
              <label>Số điện thoại</label>
              <Input
                value={profileForm.soDienThoai}
                onChange={e => { setProfileForm({ ...profileForm, soDienThoai: e.target.value }); setFormErrors(prev => ({ ...prev, soDienThoai: '' })); }}
                placeholder="Số điện thoại"
              />
              {formErrors.soDienThoai && <div style={{ color: 'red', marginTop: '4px' }}>{formErrors.soDienThoai}</div>}
            </div>
            <div>
              <label>Email</label>
              <Input
                value={profileForm.email}
                onChange={e => { setProfileForm({ ...profileForm, email: e.target.value }); setFormErrors(prev => ({ ...prev, email: '' })); }}
                placeholder="Email"
              />
              {formErrors.email && <div style={{ color: 'red', marginTop: '4px' }}>{formErrors.email}</div>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Giới tính</label>
              <Radio.Group onChange={e => setProfileForm({ ...profileForm, gioiTinh: e.target.value })} value={profileForm.gioiTinh}>
                <Radio value={true}>Nam</Radio>
                <Radio value={false}>Nữ</Radio>
              </Radio.Group>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Ngày sinh</label>
              <DatePicker
                style={{ width: '100%' }}
                format="DD-MM-YYYY"
                value={profileForm.ngaySinh}
                disabledDate={(current) => current && current > dayjs().subtract(18, 'year')}
                onChange={date => { setProfileForm({ ...profileForm, ngaySinh: date }); setFormErrors(prev => ({ ...prev, ngaySinh: '' })); }}
              />
              {formErrors.ngaySinh && <div style={{ color: 'red', marginTop: '4px' }}>{formErrors.ngaySinh}</div>}
            </div>
          </div>
        ) : (
          <Descriptions bordered column={1} size="middle" labelStyle={{ width: 140, fontWeight: 500 }}>
            <Descriptions.Item label="Họ và tên">{localStorage.getItem('hoTen') || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Email">{localStorage.getItem('email') || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{localStorage.getItem('soDienThoai') || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {localStorage.getItem('gioiTinh') === 'true' ? 'Nam' : (localStorage.getItem('gioiTinh') === 'false' ? 'Nữ' : 'N/A')}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {localStorage.getItem('ngaySinh')
                ? (dayjs(localStorage.getItem('ngaySinh'), ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM/DD/YYYY']).isValid() 
                    ? dayjs(localStorage.getItem('ngaySinh'), ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM/DD/YYYY']).format('DD-MM-YYYY') 
                    : (dayjs(localStorage.getItem('ngaySinh')).isValid() ? dayjs(localStorage.getItem('ngaySinh')).format('DD-MM-YYYY') : localStorage.getItem('ngaySinh')))
                : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Tag color="blue">{localStorage.getItem('role') === 'ROLE_ADMIN' ? 'ADMIN' : (localStorage.getItem('role') || 'N/A')}</Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Layout>
  );
};

export default AdminLayout;
