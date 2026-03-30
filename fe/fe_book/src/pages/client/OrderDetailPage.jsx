import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Steps, Table, Divider, Button, Tag, Spin, message, Modal, Input } from 'antd';
import {
  ArrowLeftOutlined,
  FormOutlined,
  FileDoneOutlined,
  InboxOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CreditCardFilled,
  CloseCircleOutlined
} from '@ant-design/icons';
import { getMyOrderDetail } from '../../services/client/ProfileCustomer';
import { cancelHoaDon } from '../../services/client/HoaDonCustomerService';
import { formatDate } from '../../utils/format';
import './OrderDetailPage.css';



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

const OrderDetailPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelNote, setCancelNote] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await getMyOrderDetail(id);
      console.log("Check res", res);

      setOrderData(res);
    } catch (error) {
      message.error("Lỗi khi tải chi tiết đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = orderData?.lichSuDonHang?.length
    ? orderData.lichSuDonHang.length - 1
    : 0;

  const handleCancelOrder = async () => {
    if (!cancelNote.trim()) {
      message.warning("Vui lòng nhập lý do hủy đơn.");
      return;
    }
    try {
      setCancelLoading(true);
      await cancelHoaDon(id, cancelNote.trim());
      message.success("Hủy đơn hàng thành công!");
      setIsCancelModalOpen(false);
      setCancelNote('');
      fetchOrderDetail();
    } catch (error) {
      message.error(error?.response?.data || "Hủy đơn hàng thất bại!");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (!orderData || !orderData.hoaDon) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Không tìm thấy thông tin đơn hàng.</div>;
  }

  const { hoaDon, chiTiets } = orderData;
  const currentStatusConfig = statusConfig[hoaDon.trangThai] || { label: hoaDon.trangThai, color: 'default', text: hoaDon.trangThai };

  const subtotal = hoaDon.tongTienHang || 0;
  const shippingFee = hoaDon.phiShip || 0;
  const discount = hoaDon.giamGia || 0;
  const totalAmount = subtotal + shippingFee - discount;

  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
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

  return (
    <div className="order-detail-page">
      <div className="od-header">
        <Link to="/account/orders">
          <Button icon={<ArrowLeftOutlined />}>Quay lại đơn hàng</Button>
        </Link>
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
          items={buildSteps(orderData?.lichSuDonHang)}
        />
      </div>

      <div className="od-section od-info-grid">
        <div className="od-info-box">
          <h3>Thông tin đơn hàng</h3>
          <p><strong>{hoaDon.hoTenKhachHang}</strong></p>
          <p>SĐT: {hoaDon.soDienThoai}</p>
          <p>{hoaDon.diaChiGiaoHang}</p>
        </div>
        <div className="od-info-box">

          <p style={{ marginTop: '50px' }}>Phương thức: {hoaDon.phuongThuc === 'TIEN_MAT' ? 'Tiền mặt' : hoaDon.phuongThuc === 'CHUYEN_KHOAN' ? 'Chuyển khoản' : 'Không xác định'}</p>
          <p>Ghi chú: {hoaDon.ghiChu || 'Không có'}</p>
          {hoaDon.trangThai === 'CHO_XAC_NHAN' && (
            <Button danger size="small" style={{ marginTop: '10px' }} onClick={() => setIsCancelModalOpen(true)}>Hủy đơn hàng</Button>
          )}
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

      <Modal
        title="Xác nhận hủy đơn hàng"
        open={isCancelModalOpen}
        onOk={handleCancelOrder}
        confirmLoading={cancelLoading}
        onCancel={() => {
          setIsCancelModalOpen(false);
          setCancelNote('');
        }}
        okText="Xác nhận hủy"
        okType="danger"
        cancelText="Đóng"
      >
        <p style={{ marginBottom: '10px' }}>Vui lòng nhập lý do bạn muốn hủy đơn hàng này:</p>
        <Input.TextArea
          rows={4}
          value={cancelNote}
          onChange={(e) => setCancelNote(e.target.value)}
          placeholder="Lý do hủy..."
        />
      </Modal>

    </div>
  );
};

export default OrderDetailPage;
