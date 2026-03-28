import { Link } from 'react-router-dom';
import { Tag, Button, Divider } from 'antd';
import { EyeFilled } from '@ant-design/icons';
import './OrdersPage.css';

const mockOrders = [
  {
    id: 'HD881712',
    date: '23-12-2023 16:37:35',
    status: 'pending',
    totalAmount: 935000,
    items: [
      {
        id: 1,
        title: 'Đắc Nhân Tâm – How to Win Friends and Influence People',
        image: 'https://picsum.photos/seed/book1/80/110',
        price: 89000,
        qty: 1,
      },
      {
        id: 2,
        title: 'Nhà Giả Kim (Tái Bản 2023)',
        image: 'https://picsum.photos/seed/book2/80/110',
        price: 125000,
        qty: 2,
      },
    ],
  },
  {
    id: 'HD880199',
    date: '20-12-2023 10:15:00',
    status: 'completed',
    totalAmount: 450000,
    items: [
      {
        id: 3,
        title: 'Hiểu Về Trái Tim',
        image: 'https://picsum.photos/seed/book3/80/110',
        price: 150000,
        qty: 3,
      },
    ],
  },
];

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'orange' },
  confirmed: { label: 'Đã xác nhận', color: 'blue' },
  shipping: { label: 'Đang giao hàng', color: 'cyan' },
  completed: { label: 'Hoàn thành', color: 'green' },
  cancelled: { label: 'Đã hủy', color: 'red' },
};

const OrdersPage = () => {
  return (
    <div className="orders-page">
      <h2 className="page-title">Đơn hàng đã mua</h2>

      <div className="orders-list">
        {mockOrders.length === 0 ? (
          <div className="empty-orders">Chưa có đơn hàng nào.</div>
        ) : (
          mockOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span className="order-id">Mã đơn: <strong>{order.id}</strong></span>
                <span className="order-date">{order.date}</span>
                <Tag color={statusConfig[order.status]?.color} className="order-status">
                  {statusConfig[order.status]?.label}
                </Tag>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.id} className="oi-row">
                    <img src={item.image} alt={item.title} className="oi-img" />
                    <div className="oi-info">
                      <p className="oi-title">{item.title}</p>
                      <p className="oi-qty">x{item.qty}</p>
                    </div>
                    <div className="oi-price">
                      {item.price.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                ))}
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div className="order-footer">
                <div className="order-total-box">
                  <span className="ot-label">Thành tiền:</span>
                  <span className="ot-value">{order.totalAmount.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="order-actions">
                  <Link to={`/account/orders/${order.id}`}>
                    <Button type="primary" ghost className="detail-order"><EyeFilled /> Chi tiết</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
