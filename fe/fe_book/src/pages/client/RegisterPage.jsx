import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Breadcrumb, Input, Button, message } from 'antd';
import { register } from '../../services/AuthService';
import './LoginPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add('login-body');
    return () => document.body.classList.remove('login-body');
  }, []);

  const handleRegister = async () => {
    const payload = {
      hoTen: hoTen.trim(),
      email: email.trim(),
      soDienThoai: soDienThoai.trim(),
    };

    if (!payload.hoTen || !payload.email || !payload.soDienThoai) {
      message.error('Vui lòng nhập đầy đủ thông tin đăng ký');
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(payload.soDienThoai)) {
      message.error('Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số');
      return;
    }

    setLoading(true);
    try {
      const res = await register(payload);
      message.success(res?.message || 'Đăng ký thành công, vui lòng kiểm tra email để nhận mật khẩu');
      navigate('/login');
    } catch (error) {
      message.error(error?.response?.data || error?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Breadcrumb
        className="login-breadcrumb"
        items={[
          { title: <Link to="/">Trang chủ</Link> },
          { title: 'Đăng ký' },
        ]}
      />

      <div className="login-container">
        <div className="login-image">
          <img
            src="https://img.freepik.com/free-vector/sign-up-concept-illustration_114360-7885.jpg"
            alt="Register Illustration"
          />
        </div>

        <div className="login-form-wrapper">
          <h1 className="login-title">Đăng ký tài khoản</h1>

          <div className="login-form">
            <div className="form-group">
              <label className="form-label">Họ và tên:</label>
              <Input
                size="large"
                className="login-input"
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email:</label>
              <Input
                size="large"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại:</label>
              <Input
                size="large"
                className="login-input"
                maxLength={10}
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value.replace(/\D/g, ''))}
                onPressEnter={handleRegister}
              />
            </div>

            <Button
              type="primary"
              size="large"
              className="btn-login-submit"
              block
              loading={loading}
              onClick={handleRegister}
            >
              Đăng ký
            </Button>

            <div className="login-footer">
              Đã có tài khoản? <Link to="/login" className="register-link">Đăng nhập</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
