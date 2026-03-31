import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Breadcrumb, Input, Checkbox, Button, message } from 'antd';
import { login } from '../../services/AuthService';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add('login-body');

    return () => {
      document.body.classList.remove('login-body');
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !matKhau) {
      message.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, matKhau);
      if (data && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email || "");
        localStorage.setItem("hoTen", data.hoTen || "");
        localStorage.setItem("soDienThoai", data.soDienThoai || "");
        localStorage.setItem("gioiTinh", data.gioiTinh !== undefined ? data.gioiTinh : "");
        localStorage.setItem("ngaySinh", data.ngaySinh || "");
        localStorage.setItem("role", data.role || "");

        message.success("Đăng nhập thành công!");

        if (data.role === "ROLE_ADMIN") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        message.error("Email hoặc mật khẩu không chính xác!");
      } else {
        message.error("Đăng nhập thất bại. Vui lòng kiểm tra lại!");
      }
      console.error("Login error:", error);
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
          { title: 'Đăng nhập' },
        ]}
      />

      <div className="login-container">

        <div className="login-image">
          <img
            src="https://img.freepik.com/free-vector/computer-login-concept-illustration_114360-7962.jpg"
            alt="Login Illustration"
          />
        </div>

        <div className="login-form-wrapper">
          <h1 className="login-title">Đăng nhập</h1>

          <div className="login-form">
            <div className="form-group">
              <label className="form-label">Email / Tên đăng nhập:</label>
              <Input
                size="large"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu:</label>
              <Input.Password
                size="large"
                className="login-input"
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                onPressEnter={handleLogin}
              />
            </div>

            <div className="form-options">
              <Checkbox className="remember-cb">Nhớ mật khẩu</Checkbox>
              <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>
            </div>

            <Button
              type="primary"
              size="large"
              className="btn-login-submit"
              block
              loading={loading}
              onClick={handleLogin}
            >
              Đăng nhập
            </Button>

            <div className="login-footer">
              Bạn Chưa Có Tài Khoản? <Link to="/register" className="register-link">Tạo tài khoản ngay</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;