import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Input,
  Select,
  Radio,
  Checkbox,
  Button,
  InputNumber,
  Divider,
} from 'antd';
import {
  DeleteOutlined,
  TagOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import './CartPage.css';

const { Option } = Select;
const { TextArea } = Input;

/* --- MOCK DATA --- */
const mockCartItems = [
  {
    id: 1,
    title: 'Đắc Nhân Tâm – How to Win Friends and Influence People',
    image: 'https://picsum.photos/seed/book1/100/140',
    price: 89000,
    originalPrice: 120000,
    quantity: 1,
  },
  {
    id: 2,
    title: 'Nhà Giả Kim (Tái Bản 2023)',
    image: 'https://picsum.photos/seed/book2/100/140',
    price: 125000,
    originalPrice: 160000,
    quantity: 2,
  },
];

const provinces = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Thái Bình', 'Cần Thơ'];
const districts = ['Quận 1', 'Quận 3', 'Gò Vấp', 'Đông Hưng', 'Thái Thụy'];
const wards = ['Phường 1', 'Phường Bến Nghé', 'Xã Phú Lương', 'Thị trấn Diêm Điền'];
const stores = [
  'CS1: 123 Nguyễn Huệ, Q.1, TP.HCM',
  'CS2: 45 Lê Lợi, Q.1, TP.HCM',
  'CS3: 10 Tràng Tiền, Hoàn Kiếm, HN',
];

const CartPage = () => {
  const [items, setItems] = useState(mockCartItems);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery'); // 'delivery' or 'store'
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'vnpay'
  const [termsAccepted, setTermsAccepted] = useState(true);

  const sumAmount = items.reduce((acc, obj) => acc + obj.price * obj.quantity, 0);
  const discountAmount = 0; // if promo applied
  const finalTotal = sumAmount - discountAmount;

  // Handlers
  const handleUpdateQty = (id, val) => {
    if (val < 1) return;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: val } : item)));
  };

  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-left">
          <h2 className="cart-page-title">Giỏ hàng của bạn</h2>
          <div className="cart-section section-products">
            {items.length === 0 ? (
              <p>Giỏ hàng trống. <Link to="/products">Tiếp tục mua sắm</Link></p>
            ) : (
              <div className="cart-items-list">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.title} className="ci-img" />
                    <div className="ci-info">
                      <Link to={`/products/${item.id}`} className="ci-title">
                        {item.title}
                      </Link>
                      <div className="ci-price-row">
                        <span className="ci-current-price">{item.price.toLocaleString('vi-VN')}₫</span>
                        {item.originalPrice && (
                          <span className="ci-original-price">
                            {item.originalPrice.toLocaleString('vi-VN')}₫
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ci-actions">
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        onChange={(val) => handleUpdateQty(item.id, val)}
                        className="ci-qty-input"
                      />
                      <span className="ci-total-item">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </span>
                      <button className="ci-remove-btn" onClick={() => handleRemoveItem(item.id)}>
                        <DeleteOutlined />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="cart-section">
            <h3 className="section-title">Thông tin khách hàng</h3>
            <div className="form-grid">
              <Input placeholder="Họ và tên (bắt buộc)" size="large" />
              <Input placeholder="Số điện thoại (bắt buộc)" size="large" />
              <Input placeholder="Email (không bắt buộc)" size="large" className="full-width" />
            </div>
          </div>

          <div className="cart-section">
            <h3 className="section-title">Hình thức nhận hàng</h3>
            <div className="delivery-methods">
              <Radio.Group
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
                className="delivery-radio-group"
              >
                <Radio value="delivery">Giao tận nơi</Radio>
                <Radio value="store">Nhận tại cửa hàng</Radio>
              </Radio.Group>
            </div>

            <div className="delivery-details-box">
              {deliveryMethod === 'delivery' ? (
                <>
                  <div className="form-grid address-grid">
                    <Select placeholder="Chọn Tỉnh/Thành phố" size="large">
                      {provinces.map((p) => <Option key={p} value={p}>{p}</Option>)}
                    </Select>
                    <Select placeholder="Chọn Quận/Huyện" size="large">
                      {districts.map((d) => <Option key={d} value={d}>{d}</Option>)}
                    </Select>
                    <Select placeholder="Chọn Phường/Xã" size="large" className="full-width">
                      {wards.map((w) => <Option key={w} value={w}>{w}</Option>)}
                    </Select>
                    <Input placeholder="Địa chỉ cụ thể (Số nhà, tên đường...)" size="large" className="full-width" />
                  </div>
                </>
              ) : (
                <div className="form-grid">
                  <Select placeholder="Chọn cửa hàng" size="large" className="full-width">
                    {stores.map((s) => <Option key={s} value={s}>{s}</Option>)}
                  </Select>
                </div>
              )}

              <TextArea
                rows={3}
                placeholder="Nhập ghi chú (nếu có)"
                className="note-input"
              />

            </div>
          </div>

          <div className="cart-section">
            <h3 className="section-title">Hình thức thanh toán</h3>
            <div className="payment-methods">
              <Radio.Group
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="payment-radio-group"
              >
                <div className="payment-option">
                  <Radio value="cod">
                    <div className="po-content">
                      <img src="https://cdn-icons-png.flaticon.com/512/2800/2800250.png" alt="COD" className="po-icon" />
                      <span>Thanh toán khi nhận hàng (COD)</span>
                    </div>
                  </Radio>
                </div>
                <div className="payment-option">
                  <Radio value="vnpay">
                    <div className="po-content">
                      <img src="https://vinadesign.vn/uploads/thumbnails/800/2023/05/vnpay-logo-vinadesign-25-12-59-16.jpg" alt="VNPAY" className="po-icon vnpay-icon" />
                      <span>Thanh toán qua VNPAY</span>
                    </div>
                  </Radio>
                </div>
              </Radio.Group>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: Order Summary === */}
        <div className="cart-right">
          <div className="summary-section">
            {/* Promo Code */}
            <div className="promo-box">
              <div className="promo-header">
                <TagOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                <span>Sử dụng mã giảm giá</span>
              </div>
              <div className="promo-input">
                <Input placeholder="Nhập mã giảm giá" size="large" />
                <Button type="primary" size="large">Áp dụng</Button>
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Calculations */}
            <div className="summary-row">
              <span className="sr-label">Tạm tính:</span>
              <span className="sr-value">{sumAmount.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="summary-row">
              <span className="sr-label">Phí vận chuyển:</span>
              <span className="sr-value">Miễn phí</span>
            </div>
            {discountAmount > 0 && (
              <div className="summary-row discount-row">
                <span className="sr-label">Giảm giá:</span>
                <span className="sr-value">-{discountAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            )}

            <Divider style={{ margin: '16px 0' }} />

            <div className="summary-row total-row">
              <span className="sr-label-total">Tổng tiền:</span>
              <span className="sr-value-total">{finalTotal.toLocaleString('vi-VN')}₫</span>
            </div>

            {/* Terms checkbox */}
            <div className="terms-checkbox">
              <Checkbox
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              >
                Tôi đã đọc và đồng ý với <Link to="/terms">điều khoản và điều kiện</Link> của website
              </Checkbox>
            </div>

            {/* Checkout Button */}
            <Button
              type="primary"
              size="large"
              className="btn-checkout-submit"
              block
              disabled={!termsAccepted || items.length === 0}
            >
              Tiến hành đặt hàng
            </Button>
            <p className="checkout-hint">
              {paymentMethod === 'cod'
                ? 'Nhận hàng nhanh chóng, thanh toán tại nhà'
                : 'Chuyển hướng đến cổng thanh toán an toàn VNPAY'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
