import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, Input, Button, Steps, Table, Divider, message } from 'antd';
import {
  SearchOutlined,
  ArrowLeftOutlined,
  FormOutlined,
  FileDoneOutlined,
  InboxOutlined,
  CarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import './SearchOrderPage.css';

const mockOrderDetails = {
  id: 'HD881712',
  date: '23-12-2023 16:37:35',
  status: 'shipping',
  customerInfo: {
    name: 'Nguyễn Văn Khánh',
    phone: '0987 654 321',
    address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
    note: 'Giao trong giờ hành chính',
  },
  paymentType: 'Tiền mặt (COD)',
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
  subtotal: 339000,
  shippingFee: 0,
  discount: 20000,
  totalAmount: 319000,
};

const getStepCurrent = (status) => {
  switch (status) {
    case 'pending': return 0;
    case 'confirmed': return 1;
    case 'waiting_shipping': return 2;
    case 'shipping': return 3;
    case 'completed': return 4;
    case 'cancelled': return 0;
    default: return 0;
  }
};

const SearchOrderPage = () => {
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!phone || !orderId) {
      message.error('Vui lòng nhập Số điện thoại và Mã đơn hàng');
      return;
    }
    setLoading(true);
    // Mock API delay
    setTimeout(() => {
      setLoading(false);
      // Giả lập tìm thấy đơn
      if (orderId === 'HD881712' || orderId === '1') {
        setOrder(mockOrderDetails);
      } else {
        message.error('Không tìm thấy đơn hàng nào khớp với thông tin trên');
      }
    }, 1000);
  };

  const resetSearch = () => {
    setOrder(null);
    setPhone('');
    setOrderId('');
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <div className="table-product">
          <img src={record.image} alt={record.title} className="tp-img" />
          <span className="tp-title">{record.title}</span>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')}₫`,
    },
    {
      title: 'Số lượng',
      dataIndex: 'qty',
      key: 'qty',
      align: 'center',
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'right',
      render: (_, record) => (
        <strong className="tp-total">
          {(record.price * record.qty).toLocaleString('vi-VN')}₫
        </strong>
      ),
    },
  ];

  if (order) {
    const currentStep = getStepCurrent(order.status);
    return (
      <div className="search-order-page detail-view">
        <Breadcrumb
          className="search-breadcrumb"
          items={[
            { title: <Link to="/">Trang chủ</Link> },
            { title: <span style={{ cursor: 'pointer' }} onClick={resetSearch}>Tra cứu đơn hàng</span> },
            { title: 'Chi tiết' },
          ]}
        />

        <div className="od-header">
          <Button icon={<ArrowLeftOutlined />} onClick={resetSearch}>
            Tra cứu đơn khác
          </Button>
          <div className="od-id-status">
            <span className="od-id">Mã đơn hàng: <strong>{order.id}</strong></span>
            <span className="od-split">|</span>
            <span className="od-status-text">
              {order.status === 'shipping' ? 'Đang vận chuyển' : 'TRẠNG THÁI'}
            </span>
          </div>
        </div>

        <div className="od-section od-timeline">
          <Steps
            current={currentStep}
            labelPlacement="vertical"
            className="custom-order-steps"
            items={[
              { title: 'Chờ xác nhận', description: order.date, icon: <FormOutlined /> },
              { title: 'Đã xác nhận', icon: <FileDoneOutlined /> },
              { title: 'Chờ vận chuyển', icon: <InboxOutlined /> },
              { title: 'Đang giao hàng', icon: <CarOutlined /> },
              { title: 'Thành công', icon: <CheckCircleOutlined /> },
            ]}
          />
        </div>

        <div className="od-section od-info-grid">
          <div className="od-info-box">
            <h3>Thông tin người nhận</h3>
            <p><strong>{order.customerInfo.name}</strong></p>
            <p>SĐT: {order.customerInfo.phone}</p>
            <p>{order.customerInfo.address}</p>
          </div>
          <div className="od-info-box">
            <h3>Hình thức thanh toán & Ghi chú</h3>
            <p>Phương thức: {order.paymentType}</p>
            <p>Ghi chú: {order.customerInfo.note || 'Không có'}</p>
          </div>
        </div>

        <div className="od-section od-products">
          <h3>Chi tiết sản phẩm</h3>
          <Table
            dataSource={order.items}
            columns={columns}
            rowKey="id"
            pagination={false}
            bordered
          />
        </div>

        <div className="od-summary">
          <div className="ods-row">
            <span>Tổng tiền hàng:</span>
            <span>{order.subtotal.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="ods-row">
            <span>Phí vận chuyển:</span>
            <span>{order.shippingFee.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="ods-row">
            <span>Voucher giảm giá:</span>
            <span>-{order.discount.toLocaleString('vi-VN')}₫</span>
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div className="ods-row ods-total">
            <span>Tổng thanh toán:</span>
            <span className="ods-total-price">{order.totalAmount.toLocaleString('vi-VN')}₫</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-order-page form-view">
      <Breadcrumb
        className="search-breadcrumb"
        items={[
          { title: <Link to="/">Trang chủ</Link> },
          { title: 'Tra cứu đơn hàng' },
        ]}
      />

      <div className="search-container">
        <div className="search-image">
          <img
            src="https://img.freepik.com/free-vector/delivery-service-with-mask-concept_23-2148497067.jpg"
            alt="Search Order Illustration"
          />
        </div>

        <div className="search-form-wrapper">
          <h1 className="search-title">Tra cứu đơn hàng</h1>
          <p className="search-subtitle">Kiểm tra trạng thái đơn hàng của bạn bằng số điện thoại và mã đơn hàng.</p>

          <div className="search-form">
            <div className="form-group">
              <label className="form-label">Số điện thoại đặt hàng:</label>
              <Input
                size="large"
                placeholder="Ví dụ: 0987123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mã đơn hàng:</label>
              <Input
                size="large"
                placeholder="Ví dụ: HD881712"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>

            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              className="btn-search-submit"
              loading={loading}
              onClick={handleSearch}
              block
            >
              Tra cứu ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOrderPage;
