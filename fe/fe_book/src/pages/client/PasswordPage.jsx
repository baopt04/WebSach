import { useState } from 'react';
import { Input, Button, message, Modal } from 'antd';
import './PasswordPage.css';
import { changePassword } from '../../services/client/ProfileCustomer';

const PasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      message.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (newPassword.includes(' ') || oldPassword.includes(' ')) {
      message.error('Mật khẩu không được chứa khoảng trắng!');
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 50) {
      message.error('Mật khẩu mới phải từ 6 đến 50 ký tự!');
      return;
    }

    if (oldPassword === newPassword) {
      message.error('Mật khẩu mới phải khác với mật khẩu hiện tại!');
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp với mật khẩu mới!');
      return;
    }
    Modal.confirm({
      title: 'Xác nhận đổi mật khẩu',
      content: 'Bạn có chắc chắn muốn đổi mật khẩu không?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(true);
          await changePassword({
            matKhauCu: oldPassword,
            matKhauMoi: newPassword,
            xacNhanMatKhauMoi: confirmPassword
          });
          message.success('Đổi mật khẩu thành công!');
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
          localStorage.removeItem("token");
          localStorage.removeItem("email");
          localStorage.removeItem("hoTen");
          localStorage.removeItem("soDienThoai");
          localStorage.removeItem("gioiTinh");
          localStorage.removeItem("ngaySinh");
          localStorage.removeItem("role");
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);

        } catch (error) {
          message.error(error?.response?.data || error?.message || 'Đổi mật khẩu thất bại!');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="password-page">
      <h2 className="page-title">Đổi mật khẩu</h2>

      <div className="password-card">
        <p className="password-subtitle">
          Để bảo vệ tài khoản, vui lòng không chia sẻ mật khẩu cho bất kỳ ai.
        </p>

        <div className="pw-form">
          <div className="pw-form-group">
            <label>Mật khẩu hiện tại</label>
            <Input.Password
              size="large"
              placeholder="Nhập mật khẩu hiện tại"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="pw-form-group">
            <label>Mật khẩu mới</label>
            <Input.Password
              size="large"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="pw-form-group">
            <label>Xác nhận mật khẩu mới</label>
            <Input.Password
              size="large"
              placeholder="Xác nhận lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="pw-actions">
            <Button
              type="primary"
              size="large"
              className="btn-save-pw"
              loading={loading}
              onClick={handleSave}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordPage;