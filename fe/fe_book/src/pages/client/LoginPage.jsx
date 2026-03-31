import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Breadcrumb, Input, Checkbox, Button } from 'antd';
import './LoginPage.css';

const LoginPage = () => {
  useEffect(() => {
    document.body.classList.add('login-body');

    return () => {
      document.body.classList.remove('login-body');
    };
  }, []);
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
              <label className="form-label">Tên đăng nhập:</label>
              <Input size="large" className="login-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu:</label>
              <Input.Password size="large" className="login-input" />
            </div>

            <div className="form-options">
              <Checkbox className="remember-cb">Nhớ mật khẩu</Checkbox>
              <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>
            </div>

            <Button type="primary" size="large" className="btn-login-submit" block>
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
