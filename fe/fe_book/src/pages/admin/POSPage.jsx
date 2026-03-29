import { useState } from 'react';
import { Card, Row, Col, Input, Button, InputNumber, Select, Divider, Typography, List, Avatar, Empty, message, Space, Tag } from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  PrinterOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import PageHeader from '../../components/admin/PageHeader';
import './AdminPage.css';
import './POSPage.css';

const { Text, Title } = Typography;
const { Option } = Select;

const allBooks = [
  { id: 1, title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', price: 85000, image: 'https://picsum.photos/seed/book1/60/80' },
  { id: 2, title: 'Nhà Giả Kim', author: 'Paulo Coelho', price: 95000, image: 'https://picsum.photos/seed/book2/60/80' },
  { id: 3, title: 'Sapiens', author: 'Yuval Noah Harari', price: 260000, image: 'https://picsum.photos/seed/book3/60/80' },
  { id: 4, title: 'Tư Duy Nhanh Chậm', author: 'Daniel Kahneman', price: 259000, image: 'https://picsum.photos/seed/book4/60/80' },
  { id: 5, title: 'Muôn Kiếp Nhân Sinh', author: 'Brian Weiss', price: 175000, image: 'https://picsum.photos/seed/book5/60/80' },
  { id: 6, title: 'Dám Nghĩ Lớn', author: 'David J. Schwartz', price: 115000, image: 'https://picsum.photos/seed/book6/60/80' },
  { id: 7, title: 'Người Giàu Có Nhất Babylon', author: 'George S. Clason', price: 89000, image: 'https://picsum.photos/seed/book7/60/80' },
  { id: 8, title: 'Tôi Thấy Hoa Vàng...', author: 'Nguyễn Nhật Ánh', price: 110000, image: 'https://picsum.photos/seed/book8/60/80' },
];

const POSPage = () => {
  const [bookSearch, setBookSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const filteredBooks = allBooks.filter(
    (b) =>
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const addToCart = (book) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === book.id);
      if (existing) {
        return prev.map((item) =>
          item.id === book.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...book, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setDiscount(0);
  };

  const applyDiscount = () => {
    if (couponCode === 'BOOK10') {
      setDiscount(10);
      message.success('Áp dụng mã giảm giá 10% thành công!');
    } else if (couponCode === 'BOOK50K') {
      setDiscount(50000);
      message.success('Áp dụng mã giảm giá 50,000₫ thành công!');
    } else {
      message.error('Mã giảm giá không hợp lệ!');
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = discount > 0 && discount < 100
    ? Math.round((subtotal * discount) / 100)
    : discount;
  const total = Math.max(0, subtotal - discountAmount);

  const handleCheckout = () => {
    if (cart.length === 0) {
      message.warning('Giỏ hàng trống!');
      return;
    }
    message.success(`Thanh toán thành công! Tổng: ${total.toLocaleString('vi-VN')}₫`);
    clearCart();
  };

  return (
    <div className="admin-page">
      <PageHeader title="Bán hàng tại quầy" showAdd={false} />
      <Row gutter={16} className="pos-container">

        <Col xs={24} lg={14}>
          <Card
            title={<><SearchOutlined /> Chọn sản phẩm</>}
            bordered={false}
            className="admin-card pos-products-card"
          >
            <Input.Search
              placeholder="Tìm kiếm sách..."
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              allowClear
              style={{ marginBottom: 16 }}
            />
            <div className="pos-book-grid">
              {filteredBooks.length === 0 ? (
                <Empty description="Không tìm thấy sách" />
              ) : (
                filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="pos-book-card"
                    onClick={() => addToCart(book)}
                  >
                    <img src={book.image} alt={book.title} className="pos-book-img" />
                    <div className="pos-book-info">
                      <div className="pos-book-title">{book.title}</div>
                      <div className="pos-book-author">{book.author}</div>
                      <div className="pos-book-price">{book.price.toLocaleString('vi-VN')}₫</div>
                    </div>
                    <button className="pos-add-btn">
                      <PlusOutlined />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>


        <Col xs={24} lg={10}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><ShoppingCartOutlined /> Giỏ hàng ({cart.length} sp)</span>
                {cart.length > 0 && (
                  <Button size="small" danger icon={<ClearOutlined />} onClick={clearCart}>Xóa hết</Button>
                )}
              </div>
            }
            bordered={false}
            className="admin-card pos-cart-card"
          >
            {cart.length === 0 ? (
              <Empty description="Chưa có sản phẩm" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                dataSource={cart}
                renderItem={(item) => (
                  <List.Item className="pos-cart-item">
                    <div className="pos-cart-item-info">
                      <img src={item.image} alt={item.title} className="pos-cart-img" />
                      <div>
                        <div className="pos-cart-title">{item.title}</div>
                        <div className="pos-cart-price">{item.price.toLocaleString('vi-VN')}₫</div>
                      </div>
                    </div>
                    <div className="pos-cart-controls">
                      <Space size={4}>
                        <Button size="small" icon={<MinusOutlined />} onClick={() => updateQty(item.id, -1)} />
                        <span className="pos-cart-qty">{item.qty}</span>
                        <Button size="small" icon={<PlusOutlined />} onClick={() => updateQty(item.id, 1)} />
                        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(item.id)} />
                      </Space>
                      <div className="pos-cart-subtotal">
                        {(item.price * item.qty).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}

            <Divider />


            <div className="pos-coupon">
              <Input
                placeholder="Nhập mã giảm giá"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                style={{ flex: 1 }}
              />
              <Button type="primary" ghost onClick={applyDiscount}>Áp dụng</Button>
            </div>


            <div className="pos-summary">
              <div className="pos-summary-row">
                <Text>Tạm tính:</Text>
                <Text>{subtotal.toLocaleString('vi-VN')}₫</Text>
              </div>
              {discount > 0 && (
                <div className="pos-summary-row discount">
                  <Text>Giảm giá {typeof discount === 'number' && discount < 100 ? `(${discount}%)` : ''}:</Text>
                  <Text type="danger">-{discountAmount.toLocaleString('vi-VN')}₫</Text>
                </div>
              )}
              <Divider style={{ margin: '8px 0' }} />
              <div className="pos-summary-row total">
                <Text strong style={{ fontSize: 16 }}>Tổng cộng:</Text>
                <Text strong style={{ fontSize: 20, color: '#1677ff' }}>{total.toLocaleString('vi-VN')}₫</Text>
              </div>
            </div>


            <div className="pos-payment">
              <Text>Phương thức thanh toán:</Text>
              <Select value={paymentMethod} onChange={setPaymentMethod} style={{ width: '100%', marginTop: 6 }}>
                <Option value="cash">💵 Tiền mặt</Option>
                <Option value="transfer">🏦 Chuyển khoản</Option>
                <Option value="card">💳 Quẹt thẻ</Option>
              </Select>
            </div>


            <Button
              type="primary"
              size="large"
              block
              icon={<ShoppingCartOutlined />}
              onClick={handleCheckout}
              className="pos-checkout-btn"
            >
              Thanh toán
            </Button>
            <Button
              size="middle"
              block
              icon={<PrinterOutlined />}
              style={{ marginTop: 8 }}
            >
              In hóa đơn
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default POSPage;
