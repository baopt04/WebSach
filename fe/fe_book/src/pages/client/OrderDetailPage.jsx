import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Steps, Table, Divider, Button, Spin, message, Modal, Input, Form, Select } from 'antd';
import dayjs from 'dayjs';
import {
  ArrowLeftOutlined,
  FormOutlined,
  FileDoneOutlined,
  InboxOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CreditCardFilled,
  CloseCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { getMyOrderDetail } from '../../services/client/ProfileCustomer';
import { cancelHoaDon, updateHoaDonInfo } from '../../services/client/HoaDonCustomerService';
import { getProvinces, getDistricts, getWards, calculateShippingFee, calculateLeadTime } from '../../services/GhnApi';
import { formatDate } from '../../utils/format';
import './OrderDetailPage.css';

const { Option } = Select;

const stepConfig = {
  CHO_XAC_NHAN: { title: 'Chờ xác nhận', icon: <FormOutlined /> },
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
  CHO_XAC_NHAN: { label: 'Chờ xác nhận', color: 'gold', text: 'Chờ xác nhận' },
  DA_XAC_NHAN: { label: 'Đã xác nhận', color: 'blue', text: 'Đã xác nhận' },
  DANG_CHUAN_BI_HANG: { label: 'Đang chuẩn bị hàng', color: 'processing', text: 'Đang chuẩn bị hàng' },
  DANG_GIAO: { label: 'Đang giao', color: 'cyan', text: 'Đang giao' },
  DA_THANH_TOAN: { label: 'Đã thanh toán', color: 'purple', text: 'Đã thanh toán' },
  THANH_CONG: { label: 'Thành công', color: 'success', text: 'Thành công' },
  DA_HUY: { label: 'Đã hủy', color: 'error', text: 'Đã hủy' },
};

const CAN_CANCEL_STATUSES = ['CHO_XAC_NHAN'];

const CAN_UPDATE_STATUSES = ['CHO_XAC_NHAN'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelNote, setCancelNote] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateForm] = Form.useForm();

  const [provincesList, setProvincesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [wardsList, setWardsList] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [calculatedShip, setCalculatedShip] = useState(0);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  useEffect(() => {
    fetchOrderDetail();

    getProvinces().then(res => setProvincesList(res.data || [])).catch(() => { });
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

  const openUpdateModal = () => {
    const { hoaDon } = orderData;
    // Parse ngayNhan từ API (định dạng DD-MM-YYYY hoặc ISO)
    let ngayNhanValue = null;
    if (hoaDon.ngayNhan) {
      const parsed = dayjs(hoaDon.ngayNhan, 'DD-MM-YYYY', true);
      ngayNhanValue = parsed.isValid() ? parsed : dayjs(hoaDon.ngayNhan);
      if (!ngayNhanValue.isValid()) ngayNhanValue = null;
    }
    updateForm.setFieldsValue({
      hoTen: hoaDon.hoTenKhachHang || '',
      soDienThoai: hoaDon.soDienThoai || '',
      email: hoaDon.email || '',
      diaChiChiTiet: '',
      ngayNhan: ngayNhanValue,
      ghiChu: hoaDon.ghiChu || '',
    });
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistrictsList([]);
    setWardsList([]);
    setCalculatedShip(0);
    setIsUpdateModalOpen(true);
  };

  const handleProvinceChange = async (provinceId) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setWardsList([]);
    setCalculatedShip(0);
    updateForm.setFieldsValue({ idQuanHuyen: null, idPhuongXa: null });
    try {
      const res = await getDistricts(provinceId);
      setDistrictsList(res.data || []);
    } catch { setDistrictsList([]); }
  };

  const handleDistrictChange = async (districtId) => {
    setSelectedDistrict(districtId);
    setSelectedWard(null);
    setCalculatedShip(0);
    setEstimatedDelivery('');
    updateForm.setFieldsValue({ idPhuongXa: null, phiShipHienThi: '', ngayNhanHienThi: '' });
    try {
      const res = await getWards(districtId);
      setWardsList(res.data || []);
    } catch { setWardsList([]); }
  };

  const handleWardChange = async (wardCode) => {
    setSelectedWard(wardCode);
    if (!selectedDistrict || !wardCode) return;
    try {
      const [feeRes, leadRes] = await Promise.all([
        calculateShippingFee({ toDistrictId: selectedDistrict, toWardCode: wardCode, weight: 300 }),
        calculateLeadTime({ toDistrictId: selectedDistrict, toWardCode: wardCode }),
      ]);

      const fee = Math.round(feeRes?.data?.total || 0);
      setCalculatedShip(fee);

      // leadtime trả về unix timestamp (giây)
      const leadTimestamp = leadRes?.data?.leadtime;
      let deliveryStr = '';
      if (leadTimestamp) {
        const d = dayjs.unix(leadTimestamp);
        deliveryStr = d.isValid() ? d.format('DD-MM-YYYY') : '';
      }
      setEstimatedDelivery(deliveryStr);

      // Điền vào 2 trường hiển thị (disabled)
      updateForm.setFieldsValue({
        phiShipHienThi: fee > 0 ? fee.toLocaleString('vi-VN') + '₫' : 'Chưa tính',
        ngayNhanHienThi: deliveryStr || 'Không xác định',
      });
    } catch {
      setCalculatedShip(0);
      setEstimatedDelivery('');
      updateForm.setFieldsValue({ phiShipHienThi: '', ngayNhanHienThi: '' });
    }
  };

  const handleUpdateInfo = async () => {
    try {
      const values = await updateForm.validateFields();
      setUpdateLoading(true);

      const tenPhuongXa = wardsList.find(w => w.WardCode === selectedWard)?.WardName || '';
      const tenQuanHuyen = districtsList.find(d => d.DistrictID === selectedDistrict)?.DistrictName || '';
      const tenTinhThanh = provincesList.find(p => p.ProvinceID === selectedProvince)?.ProvinceName || '';
      const parts = [values.diaChiChiTiet, tenPhuongXa, tenQuanHuyen, tenTinhThanh].filter(Boolean);
      const diaChiGiaoHang = parts.join(', ');

      const payload = {
        hoTen: values.hoTen,
        soDienThoai: values.soDienThoai,
        email: values.email || '',
        diaChiGiaoHang,
        phiShip: calculatedShip,
        ngayNhan: estimatedDelivery || '',
        ghiChu: values.ghiChu || '',
      };

      Modal.confirm({
        title: 'Xác nhận cập nhật',
        content: 'Bạn có chắc chắn muốn cập nhật thông tin nhận hàng?',
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        onOk: async () => {
          await updateHoaDonInfo(id, payload);
          message.success("Cập nhật thông tin thành công!");
          setIsUpdateModalOpen(false);
          fetchOrderDetail();
        }
      })
    } catch (error) {
      if (error?.errorFields) return;
      message.error(error?.message || "Cập nhật thất bại!");
    } finally {
      setUpdateLoading(false);
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
      {/* Header: Mã đơn + nút Hủy đơn đặt cạnh nhau */}
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
          {CAN_CANCEL_STATUSES.includes(hoaDon.trangThai) && (
            <Button danger size="small" onClick={() => setIsCancelModalOpen(true)} style={{ marginLeft: 12 }}>
              Hủy đơn hàng
            </Button>
          )}
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
          <p><strong>Họ và tên:{hoaDon.hoTenKhachHang}</strong></p>
          <p>Số điện thoại: {hoaDon.soDienThoai}</p>
          <p>Địa chỉ: {hoaDon.diaChiGiaoHang}</p>
        </div>
        <div className="od-info-box">
          {CAN_UPDATE_STATUSES.includes(hoaDon.trangThai) && (
            <Button icon={<EditOutlined />} size="small" type="primary" style={{}} onClick={openUpdateModal}>
              Cập nhật
            </Button>
          )}
          <p style={{ marginTop: '15px' }}>
            Phương thức: {hoaDon.phuongThuc === 'TIEN_MAT' ? 'Tiền mặt' : hoaDon.phuongThuc === 'CHUYEN_KHOAN' ? 'Chuyển khoản' : 'Không xác định'}
          </p>
          <p>Ngày nhận hàng: {formatDate(hoaDon.ngayNhan) || 'Không có'}</p>
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

      {/* Modal Hủy đơn */}
      <Modal
        title="Xác nhận hủy đơn hàng"
        open={isCancelModalOpen}
        onOk={handleCancelOrder}
        confirmLoading={cancelLoading}
        onCancel={() => { setIsCancelModalOpen(false); setCancelNote(''); }}
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

      {/* Modal Cập nhật thông tin nhận hàng */}
      <Modal
        title="Cập nhật thông tin nhận hàng"
        open={isUpdateModalOpen}
        onOk={handleUpdateInfo}
        confirmLoading={updateLoading}
        onCancel={() => setIsUpdateModalOpen(false)}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={560}
      >
        <Form form={updateForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="hoTen" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input placeholder="Họ và tên người nhận" />
          </Form.Item>
          <Form.Item name="soDienThoai" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
            <Input placeholder="Số điện thoại" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input placeholder="Email (không bắt buộc)" />
          </Form.Item>

          <Form.Item label="Tỉnh / Thành phố" required>
            <Select
              showSearch
              placeholder="Chọn Tỉnh / Thành phố"
              value={selectedProvince}
              onChange={handleProvinceChange}
              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            >
              {provincesList.map(p => <Option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Quận / Huyện" required>
            <Select
              showSearch
              placeholder="Chọn Quận / Huyện"
              value={selectedDistrict}
              onChange={handleDistrictChange}
              disabled={!selectedProvince}
              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            >
              {districtsList.map(d => <Option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Phường / Xã" required>
            <Select
              showSearch
              placeholder="Chọn Phường / Xã"
              value={selectedWard}
              onChange={handleWardChange}
              disabled={!selectedDistrict}
              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            >
              {wardsList.map(w => <Option key={w.WardCode} value={w.WardCode}>{w.WardName}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="diaChiChiTiet" label="Địa chỉ chi tiết (số nhà, tên đường...)" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
            <Input placeholder="VD: 123 Nguyễn Văn A" />
          </Form.Item>

          <Form.Item name="phiShipHienThi" label="Phí vận chuyển ">
            <Input disabled placeholder="" style={{ color: '#52c41a', fontWeight: 600, background: '#f6ffed' }} />
          </Form.Item>

          <Form.Item name="ngayNhanHienThi" label="Ngày giao hàng dự kiến">
            <Input disabled placeholder="" style={{ color: '#1677ff', fontWeight: 600, background: '#e6f4ff' }} />
          </Form.Item>

          <Form.Item name="ghiChu" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú cho đơn hàng (không bắt buộc)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderDetailPage;