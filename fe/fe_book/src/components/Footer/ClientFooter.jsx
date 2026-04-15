import { Link } from 'react-router-dom';
import {
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  TwitterOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Input, Button } from 'antd';
import './ClientFooter.css';

const ClientFooter = () => {
  return (
    <footer className="client-footer">
      <div className="footer-inner">

        <div className="footer-col footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-icon">📚</span>
            <span className="footer-logo-text">DREAM BOOK</span>
          </div>
          <p className="footer-desc">
            Cửa hàng sách trực tuyến hàng đầu Việt Nam. Hơn 10,000+ đầu sách
            chất lượng từ các thể loại đa dạng.
          </p>
          <div className="social-links">
            <a href="#" className="social-btn facebook" title="Facebook">
              <FacebookOutlined />
            </a>
            <a href="#" className="social-btn instagram" title="Instagram">
              <InstagramOutlined />
            </a>
            <a href="#" className="social-btn youtube" title="YouTube">
              <YoutubeOutlined />
            </a>
            <a href="#" className="social-btn twitter" title="Twitter">
              <TwitterOutlined />
            </a>
          </div>
        </div>

        {/* Col 2: Quick links */}
        <div className="footer-col">
          <h4 className="footer-title">Khám Phá</h4>
          <ul className="footer-links">
            <li><Link to="/">Trang Chủ</Link></li>
            <li><Link to="/products">Sản Phẩm</Link></li>
            <li><Link to="/about">Giới Thiệu</Link></li>
            <li><Link to="/store">Cửa Hàng</Link></li>
            <li><Link to="/contact">Liên Hệ</Link></li>
          </ul>
        </div>

        {/* Col 3: Customer support */}
        <div className="footer-col">
          <h4 className="footer-title">Hỗ Trợ</h4>
          <ul className="footer-links">
            <li><Link to="/faq">Câu Hỏi Thường Gặp</Link></li>
            <li><Link to="/shipping">Chính Sách Vận Chuyển</Link></li>
            <li><Link to="/returns">Đổi Trả & Hoàn Tiền</Link></li>
            <li><Link to="/privacy">Chính Sách Bảo Mật</Link></li>
            <li><Link to="/terms">Điều Khoản Sử Dụng</Link></li>
          </ul>
        </div>


        <div className="footer-col footer-contact">
          <h4 className="footer-title">Liên Hệ</h4>
          <div className="contact-info">
            <div className="contact-item">
              <EnvironmentOutlined />
              <span>Trường cao đẳng FPOLY Trịnh Văn Bô</span>
            </div>
            <div className="contact-item">
              <PhoneOutlined />
              <span>1800 1234 (Miễn phí)</span>
            </div>
            <div className="contact-item">
              <MailOutlined />
              <span>hello@bookstore.vn</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>© 2026 Eimi Fukada. hiihihiihi.</span>

        </div>
      </div>
    </footer>
  );
};

export default ClientFooter;
