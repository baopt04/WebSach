import { useState } from 'react';
import { Button, Tag, Divider, Input, Modal, Select, message } from 'antd';
import { PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import { formatDate } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const { Option } = Select;
const { confirm } = Modal;

const initialAddresses = [
  {
    id: 1,
    name: 'Nguyễn Văn Khánh',
    phone: '0987 654 321',
    address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
    isDefault: true,
  },
  {
    id: 2,
    name: 'Nguyễn Văn Khánh',
    phone: '0912 345 678',
    address: '45 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
    isDefault: false,
  },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rawGioiTinh = localStorage.getItem("gioiTinh");
  let genderDisplay = "Chưa cập nhật";
  if (rawGioiTinh === "true") genderDisplay = "Nam";
  if (rawGioiTinh === "false") genderDisplay = "Nữ";

  const profile = {
    name: localStorage.getItem("hoTen") || "Chưa cập nhật",
    email: localStorage.getItem("email") || "Chưa cập nhật",
    phone: localStorage.getItem("soDienThoai") || "Chưa cập nhật",
    gender: genderDisplay,
    dob: localStorage.getItem("ngaySinh") || "Chưa cập nhật",
    address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
  };

  const handleSetDefault = (id) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);



  return (
    <div className="profile-page">
      <h2 className="page-title">Hồ sơ của tôi</h2>
      <div className="profile-card">
        <div className="profile-row">
          <span className="pr-label">Họ và tên:</span>
          <span className="pr-value">{profile.name}</span>
        </div>
        <div className="profile-row">
          <span className="pr-label">Email:</span>
          <span className="pr-value">{profile.email}</span>
        </div>
        <div className="profile-row">
          <span className="pr-label">Số điện thoại:</span>
          <span className="pr-value">{profile.phone}</span>
        </div>
        <div className="profile-row">
          <span className="pr-label">Giới tính:</span>
          <span className="pr-value">{profile.gender}</span>
        </div>
        <div className="profile-row">
          <span className="pr-label">Ngày sinh:</span>
          <span className="pr-value">{formatDate(profile.dob)}</span>
        </div>
        <div className="profile-row">
          <span className="pr-label">Địa chỉ liên hệ (Mặc định):</span>
          <span className="pr-value">{profile.address}</span>
        </div>
        <div className="profile-actions" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <Button type="primary" ghost>Cập nhật hồ sơ</Button>
      
        </div>
      </div>

      <Divider style={{ margin: '32px 0 24px' }} />

      <div className="addresses-header">
        <h2 className="page-title">Danh sách địa chỉ</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenModal}
        >
          Thêm địa chỉ mới
        </Button>
      </div>

      <div className="addresses-list">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`address-card ${addr.isDefault ? 'default' : ''}`}
          >
            <div className="ac-info">
              <div className="ac-name-phone">
                <strong>{addr.name}</strong>
                <span className="ac-split">|</span>
                <span className="ac-phone">{addr.phone}</span>
              </div>
              <p className="ac-detail">{addr.address}</p>
              {addr.isDefault && (
                <Tag color="blue" className="ac-tag">
                  Mặc định
                </Tag>
              )}
            </div>
            <div className="ac-actions">
              <div className="ac-btns">
                <Button type="link">Sửa</Button>
                {!addr.isDefault && <Button type="link" danger>Xóa</Button>}
              </div>
              {!addr.isDefault && (
                <Button
                  className="btn-set-default"
                  onClick={() => handleSetDefault(addr.id)}
                >
                  Thiết lập mặc định
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        title="Thêm địa chỉ mới"
        open={isModalOpen}
        onOk={handleCloseModal}
        onCancel={handleCloseModal}
        okText="Hoàn thành"
        cancelText="Trở lại"
      >
        <div className="modal-form">
          <Input placeholder="Họ và tên" />
          <Input placeholder="Số điện thoại" />
          <Select placeholder="Chọn Tỉnh/Thành phố" style={{ width: '100%' }}>
            <Option value="hn">Hà Nội</Option>
            <Option value="hcm">TP. Hồ Chí Minh</Option>
          </Select>
          <Input placeholder="Địa chỉ cụ thể" />
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
