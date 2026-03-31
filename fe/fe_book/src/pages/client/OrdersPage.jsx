import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Button, Divider, Spin, message } from 'antd';
import { EyeFilled } from '@ant-design/icons';
import { getMyOrders } from '../../services/client/ProfileCustomer';
import { formatDate } from '../../utils/format';
import './OrdersPage.css';

const statusConfig = {
  CHO_XAC_NHAN: { label: 'Chờ xác nhận', color: 'gold' },
  DA_XAC_NHAN: { label: 'Đã xác nhận', color: 'blue' },
  DANG_CHUAN_BI_HANG: { label: 'Đang chuẩn bị hàng', color: 'processing' },
  DANG_GIAO: { label: 'Đang giao', color: 'cyan' },
  DA_THANH_TOAN: { label: 'Đã thanh toán', color: 'purple' },
  THANH_CONG: { label: 'Thành công', color: 'success' },
  DA_HUY: { label: 'Đã hủy', color: 'error' }
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getMyOrders();
      setOrders(res || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  return (
    <div className="orders-page">
      <h2 className="page-title">Đơn hàng đã mua</h2>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-orders">Chưa có đơn hàng nào.</div>
        ) : (
          orders.map((order) => {
            const totalAmount = (order.tongTienHang || 0) + (order.phiShip || 0) - (order.giamGia || 0);
            const currentStatusConfig = statusConfig[order.trangThai] || { label: order.trangThai, color: 'default' };

            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span className="order-id">Mã đơn: <strong>{order.maHoaDon}</strong></span>
                  <span className="order-date">{formatDate(order.ngayTao)}</span>
                  <Tag color={currentStatusConfig.color} className="order-status">
                    {currentStatusConfig.label}
                  </Tag>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div className="order-items">
                  {order.sanPhams?.map((item) => (
                    <div key={item.idSach} className="oi-row">
                      <img src={item.hinhAnh} alt={item.tenSach} className="oi-img" />
                      <div className="oi-info">
                        <p className="oi-title">{item.tenSach}</p>
                        <p className="oi-qty">x{item.soLuong}</p>
                      </div>
                      <div className="oi-price">
                        {item.donGia?.toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  ))}
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div className="order-footer">
                  <div className="order-total-box">
                    <span className="ot-label">Thành tiền:</span>
                    <span className="ot-value">{totalAmount.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="order-actions">
                    <Link to={`/account/orders/${order.id}`}>
                      <Button type="primary" ghost className="detail-order"><EyeFilled /> Chi tiết</Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
