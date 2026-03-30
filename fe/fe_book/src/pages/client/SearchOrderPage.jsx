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
  CheckCircleOutlined,
  CreditCardFilled,
  CloseCircleOutlined
} from '@ant-design/icons';
import { getMySearchOrder } from '../../services/client/ProfileCustomer';
import { formatDate } from '../../utils/format';
import './SearchOrderPage.css';

const stepConfig = {
  TAO_HOA_DON: { title: 'Tạo đơn', icon: <FormOutlined /> },
  DA_XAC_NHAN: { title: 'Đã xác nhận', icon: <FileDoneOutlined /> },
  DANG_CHUAN_BI_HANG: { title: 'Chuẩn bị hàng', icon: <InboxOutlined /> },
  DANG_GIAO: { title: 'Đang giao', icon: <CarOutlined /> },
  DA_THANH_TOAN: { title: 'Đã thanh toán', icon: <CreditCardFilled /> },
  THANH_CONG: { title: 'Thành công', icon: <CheckCircleOutlined /> },
  DA_HUY: { title: 'Đã hủy', icon: <CloseCircleOutlined /> },
};

const buildSteps = (lichSu = []) => {
  return lichSu
    .slice()
    .sort((a, b) => new Date(a.ngayTao) - new Date(b.ngayTao))
    .map(item => ({
      title: stepConfig[item.trangThai]?.title || item.trangThai,
      description: formatDate(item.ngayTao),
      icon: stepConfig[item.trangThai]?.icon,
    }));
};

const statusConfig = {
  CHO_XAC_NHAN: { label: 'Chờ xác nhận', color: 'orange', text: 'Chờ xác nhận' },
  DA_XAC_NHAN: { label: 'Đã xác nhận', color: 'blue', text: 'Đã xác nhận' },
  DANG_CHUAN_BI_HANG: { label: 'Đang chuẩn bị hàng', color: 'cyan', text: 'Đang chuẩn bị hàng' },
  DANG_GIAO: { label: 'Đang giao', color: 'green', text: 'Đang giao' },
  DA_THANH_TOAN: { label: 'Đã thanh toán', color: 'red', text: 'Đã thanh toán' },
  THANH_CONG: { label: 'Thành công', color: 'blue', text: 'Thành công' },
  DA_HUY: { label: 'Đã hủy', color: 'red', text: 'Đã hủy' },
};

const SearchOrderPage = () => {
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!phone || !orderId) {
      message.error('Vui lòng nhập Số điện thoại và Mã đơn hàng');
      return;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone)) {
      message.error('Số điện thoại không đúng định dạng');
      return;
    }

    setLoading(true);
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    try {
      await delay(1000);
      const res = await getMySearchOrder(phone, orderId);
      if (res && res.hoaDon) {
        setOrder(res);
      } else {
        message.warning('Không tìm thấy đơn hàng nào khớp với thông tin trên');
        setOrder(null);
      }
    } catch (error) {
      console.error("Search order error:", error);
      message.error(error?.response?.data?.message || 'Không tìm thấy đơn hàng hoặc có lỗi xảy ra');
      setOrder(null);
    } finally {
      setLoading(false);
    }
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
          <img src={record.hinhAnh} alt={record.tenSach} className="tp-img" />
          <span className="tp-title">{record.tenSach}</span>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'donGia',
      key: 'donGia',
      render: (price) => `${price?.toLocaleString('vi-VN')}₫`,
    },
    {
      title: 'Số lượng',
      dataIndex: 'soLuong',
      key: 'soLuong',
      align: 'center',
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'right',
      render: (_, record) => (
        <strong className="tp-total">
          {((record.donGia || 0) * (record.soLuong || 0)).toLocaleString('vi-VN')}₫
        </strong>
      ),
    },
  ];

  if (order) {
    const { hoaDon, chiTiets } = order;
    const currentStatusConfig = statusConfig[hoaDon.trangThai] || { label: hoaDon.trangThai, color: 'default', text: hoaDon.trangThai };
    const currentStep = order.lichSuDonHang?.length
      ? order.lichSuDonHang.length - 1
      : 0;

    const subtotal = hoaDon.tongTienHang || 0;
    const shippingFee = hoaDon.phiShip || 0;
    const discount = hoaDon.giamGia || 0;
    const totalAmount = subtotal + shippingFee - discount;

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
            <span className="od-id">Mã đơn hàng: <strong>{hoaDon.maHoaDon}</strong></span>
            <span className="od-split">|</span>
            <span className="od-status-text" style={{ color: currentStatusConfig.color === 'default' ? 'inherit' : currentStatusConfig.color }}>
              {currentStatusConfig.text.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="od-section od-timeline">
          <Steps
            current={currentStep}
            labelPlacement="vertical"
            items={buildSteps(order.lichSuDonHang)}
          />
        </div>

        <div className="od-section od-info-grid">
          <div className="od-info-box">
            <h3>Thông tin người nhận</h3>
            <p><strong>{hoaDon.hoTenKhachHang}</strong></p>
            <p>SĐT: {hoaDon.soDienThoai}</p>
            <p>{hoaDon.diaChiGiaoHang}</p>
          </div>
          <div className="od-info-box">
            <h3 style={{ marginBottom: '10px' }}>Hình thức thanh toán & Ghi chú</h3>
            <p>Phương thức: {hoaDon.phuongThuc === 'TIEN_MAT' ? 'Tiền mặt' : hoaDon.phuongThuc === 'CHUYEN_KHOAN' ? 'Chuyển khoản' : 'Không xác định'}</p>
            <p>Ghi chú: {hoaDon.ghiChu || 'Không có'}</p>
          </div>
        </div>

        <div className="od-section od-products">
          <h3>Chi tiết sản phẩm</h3>
          <Table
            dataSource={chiTiets}
            columns={columns}
            rowKey="idSach"
            pagination={false}
            bordered
          />
        </div>

        <div className="od-summary">
          <div className="ods-row">
            <span>Tổng tiền hàng:</span>
            <span>{subtotal.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="ods-row">
            <span>Phí vận chuyển:</span>
            <span>{shippingFee.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="ods-row">
            <span>Voucher giảm giá:</span>
            <span>-{discount.toLocaleString('vi-VN')}₫</span>
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div className="ods-row ods-total">
            <span>Tổng thanh toán:</span>
            <span className="ods-total-price">{totalAmount.toLocaleString('vi-VN')}₫</span>
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
