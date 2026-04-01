import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Checkbox, Divider, Input, InputNumber, Modal, Radio, Select, Table, Tag, message } from 'antd';
import { EnvironmentOutlined, TagOutlined } from '@ant-design/icons';
import { getEligibleVouchers } from '../../services/client/VoucherCustomerService';
import { getMyAddresses, getMyProfile } from '../../services/client/ProfileCustomer';
import { getProvinces, getDistricts, getWards, calculateShippingFee, calculateLeadTime } from '../../services/GhnApi';
import { createHoaDon } from '../../services/client/HoaDonCustomerService';
import { createVnpayPaymentUrl } from '../../services/client/VNPayCustomerService';
import './CartPage.css';

const { Option } = Select;
const { TextArea } = Input;
const STORAGE_KEY = 'buyNowItem';

export default function BuyNowPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');
  const checkoutOnceRef = useRef(false);

  const [item, setItem] = useState(null);
  const [loadingItem, setLoadingItem] = useState(true);

  const [termsAccepted, setTermsAccepted] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [ordering, setOrdering] = useState(false);

  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressListOpen, setIsAddressListOpen] = useState(false);

  const [guestForm, setGuestForm] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    idTinhThanh: null,
    idQuanHuyen: null,
    idPhuongXa: null,
    diaChiChiTiet: '',
    ghiChu: '',
  });
  const [guestErrors, setGuestErrors] = useState({});

  const [provincesList, setProvincesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [wardsList, setWardsList] = useState([]);

  const [shippingFee, setShippingFee] = useState(0);
  const [leadTime, setLeadTime] = useState(null);
  const [ghiChu, setGhiChu] = useState('');

  useEffect(() => {
    const fromState = location.state?.item || null;
    if (fromState) {
      setItem(fromState);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromState));
      setLoadingItem(false);
      return;
    }
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItem(JSON.parse(saved));
      } catch {
      }
    }
    setLoadingItem(false);
  }, [location.state]);

  const generateMaHoaDon = () => `HD${Math.floor(10000 + Math.random() * 90000)}`;

  const formatDdMmYyyyForBE = (ddmmyyyy) => {
    if (!ddmmyyyy) return null;
    const [dd, mm, yyyy] = String(ddmmyyyy).split('/');
    if (!dd || !mm || !yyyy) return null;
    return `${String(dd).padStart(2, '0')}-${String(mm).padStart(2, '0')}-${yyyy}`;
  };

  const validateGuestForm = () => {
    const errors = {};
    const phone = String(guestForm.soDienThoai || '').trim();
    const email = String(guestForm.email || '').trim();
    if (!String(guestForm.hoTen || '').trim()) errors.hoTen = 'Vui lòng nhập họ và tên';
    if (!phone) errors.soDienThoai = 'Vui lòng nhập số điện thoại';
    else if (!/^(0|\+84)\d{9,10}$/.test(phone)) errors.soDienThoai = 'Số điện thoại không hợp lệ';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email không hợp lệ';
    if (!guestForm.idTinhThanh) errors.idTinhThanh = 'Vui lòng chọn Tỉnh/Thành phố';
    if (!guestForm.idQuanHuyen) errors.idQuanHuyen = 'Vui lòng chọn Quận/Huyện';
    if (!guestForm.idPhuongXa) errors.idPhuongXa = 'Vui lòng chọn Phường/Xã';
    if (!String(guestForm.diaChiChiTiet || '').trim()) errors.diaChiChiTiet = 'Vui lòng nhập địa chỉ cụ thể';
    setGuestErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const shippingFeeRounded = useMemo(() => Math.floor((shippingFee || 0) / 1000) * 1000, [shippingFee]);
  const sumAmount = useMemo(() => (item ? (Number(item.giaBan) || 0) * (Number(item.soLuong) || 0) : 0), [item]);

  useEffect(() => {
    const run = async () => {
      if (!sumAmount) {
        setVouchers([]);
        setSelectedVoucherId(null);
        return;
      }
      try {
        const res = await getEligibleVouchers(sumAmount);
        const list = res || [];
        setVouchers(list);
        if (selectedVoucherId && !list.find((v) => v.id === selectedVoucherId)) setSelectedVoucherId(null);
      } catch {
        setVouchers([]);
      }
    };
    run();
  }, [sumAmount]);

  const selectedVoucher = vouchers.find((v) => v.id === selectedVoucherId);
  const discountAmount = selectedVoucher ? selectedVoucher.giaTriGiam : 0;
  const finalTotal = Math.max(sumAmount + shippingFeeRounded - discountAmount, 0);

  useEffect(() => {
    const load = async () => {
      try {
        if (isLoggedIn) {
          const addrRes = await getMyAddresses();
          const profileRes = await getMyProfile();
          setProfile(profileRes);
          const sorted = [...(addrRes || [])].sort((a, b) => (a.macDinh && !b.macDinh ? -1 : !a.macDinh && b.macDinh ? 1 : 0));
          setAddresses(sorted);
          if (sorted.length > 0 && !selectedAddressId) setSelectedAddressId(sorted[0].id);
        }
        const provRes = await getProvinces();
        setProvincesList(provRes.data || []);
      } catch {
      }
    };
    load();
  }, [isLoggedIn]);

  useEffect(() => {
    const calc = async (districtId, wardCode) => {
      if (!districtId || !wardCode || !item) return;
      try {
        const feeRes = await calculateShippingFee({ toDistrictId: districtId, toWardCode: wardCode, weight: Math.max(Number(item.soLuong) || 1, 1) * 300 });
        setShippingFee(feeRes?.data?.total ? Math.round(feeRes.data.total) : 0);
        const timeRes = await calculateLeadTime({ toDistrictId: districtId, toWardCode: wardCode });
        if (timeRes?.data?.leadtime) {
          const d = new Date(timeRes.data.leadtime * 1000);
          setLeadTime(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
        } else setLeadTime(null);
      } catch {
        setShippingFee(0);
        setLeadTime(null);
      }
    };

    if (isLoggedIn && selectedAddressId) {
      const addr = addresses.find((a) => a.id === selectedAddressId);
      if (addr?.idQuanHuyen && addr?.idPhuongXa) calc(addr.idQuanHuyen, addr.idPhuongXa);
      else {
        setShippingFee(0);
        setLeadTime(null);
      }
      return;
    }
    if (!isLoggedIn && guestForm.idQuanHuyen && guestForm.idPhuongXa) {
      calc(guestForm.idQuanHuyen, guestForm.idPhuongXa);
      return;
    }
    setShippingFee(0);
    setLeadTime(null);
  }, [isLoggedIn, selectedAddressId, addresses, guestForm.idQuanHuyen, guestForm.idPhuongXa, item]);

  const cartColumns = [
    {
      title: 'Sản phẩm',
      key: 'tenSach',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={record.hinhAnh || 'https://via.placeholder.com/100x140?text=No+Image'} alt={record.tenSach} style={{ width: 44, height: 60, objectFit: 'cover', borderRadius: 4 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#000', fontWeight: 600, lineHeight: 1.2, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
              {record.tenSach}
            </div>
            <div style={{ color: '#ff4d4f', fontWeight: 700 }}>{record.giaBan?.toLocaleString('vi-VN')}₫</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      key: 'soLuong',
      align: 'center',
      width: 140,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.soLuong}
          onChange={(val) => {
            const next = Math.max(Number(val) || 1, 1);
            const nextItem = { ...record, soLuong: next };
            setItem(nextItem);
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextItem));
          }}
          style={{ width: 96 }}
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'right',
      width: 160,
      render: (_, record) => <span style={{ fontWeight: 800, color: '#111' }}>{(record.giaBan * record.soLuong).toLocaleString('vi-VN')}₫</span>,
    },
  ];

  const renderGuestForm = () => (
    <div className="cart-section">
      <h3 className="section-title">Thông tin giao hàng</h3>
      <div className="form-grid">
        <div>
          <Input
            placeholder="Họ và tên (bắt buộc)"
            size="large"
            value={guestForm.hoTen}
            onChange={(e) => {
              setGuestForm({ ...guestForm, hoTen: e.target.value });
              if (guestErrors.hoTen) setGuestErrors({ ...guestErrors, hoTen: undefined });
            }}
            status={guestErrors.hoTen ? 'error' : undefined}
          />
          {guestErrors.hoTen && <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{guestErrors.hoTen}</div>}
        </div>
        <div>
          <Input
            placeholder="Số điện thoại (bắt buộc)"
            size="large"
            value={guestForm.soDienThoai}
            onChange={(e) => {
              setGuestForm({ ...guestForm, soDienThoai: e.target.value });
              if (guestErrors.soDienThoai) setGuestErrors({ ...guestErrors, soDienThoai: undefined });
            }}
            status={guestErrors.soDienThoai ? 'error' : undefined}
          />
          {guestErrors.soDienThoai && <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{guestErrors.soDienThoai}</div>}
        </div>
        <div className="full-width">
          <Input
            placeholder="Email (không bắt buộc)"
            size="large"
            value={guestForm.email}
            onChange={(e) => {
              setGuestForm({ ...guestForm, email: e.target.value });
              if (guestErrors.email) setGuestErrors({ ...guestErrors, email: undefined });
            }}
            status={guestErrors.email ? 'error' : undefined}
          />
          {guestErrors.email && <div style={{ color: 'red', marginTop: 4, fontSize: 12 }}>{guestErrors.email}</div>}
        </div>
      </div>

      <div className="form-grid address-grid" style={{ marginTop: 16 }}>
        <div>
          <Select
            placeholder="Chọn Tỉnh/Thành phố"
            size="large"
            style={{ width: '100%' }}
            value={guestForm.idTinhThanh}
            onChange={async (val) => {
              setGuestForm({ ...guestForm, idTinhThanh: val, idQuanHuyen: null, idPhuongXa: null });
              setGuestErrors({ ...guestErrors, idTinhThanh: undefined, idQuanHuyen: undefined, idPhuongXa: undefined });
              const res = await getDistricts(val);
              setDistrictsList(res.data || []);
              setWardsList([]);
            }}
            showSearch
            status={guestErrors.idTinhThanh ? 'error' : undefined}
          >
            {provincesList.map((p) => <Option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</Option>)}
          </Select>
          {guestErrors.idTinhThanh && <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{guestErrors.idTinhThanh}</div>}
        </div>
        <div>
          <Select
            placeholder="Chọn Quận/Huyện"
            size="large"
            style={{ width: '100%' }}
            value={guestForm.idQuanHuyen}
            onChange={async (val) => {
              setGuestForm({ ...guestForm, idQuanHuyen: val, idPhuongXa: null });
              setGuestErrors({ ...guestErrors, idQuanHuyen: undefined, idPhuongXa: undefined });
              const res = await getWards(val);
              setWardsList(res.data || []);
            }}
            disabled={!guestForm.idTinhThanh}
            showSearch
            status={guestErrors.idQuanHuyen ? 'error' : undefined}
          >
            {districtsList.map((d) => <Option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</Option>)}
          </Select>
          {guestErrors.idQuanHuyen && <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{guestErrors.idQuanHuyen}</div>}
        </div>
        <div className="full-width">
          <Select
            placeholder="Chọn Phường/Xã"
            size="large"
            style={{ width: '100%' }}
            value={guestForm.idPhuongXa}
            onChange={(val) => {
              setGuestForm({ ...guestForm, idPhuongXa: val });
              if (guestErrors.idPhuongXa) setGuestErrors({ ...guestErrors, idPhuongXa: undefined });
            }}
            disabled={!guestForm.idQuanHuyen}
            showSearch
            status={guestErrors.idPhuongXa ? 'error' : undefined}
          >
            {wardsList.map((w) => <Option key={w.WardCode} value={w.WardCode}>{w.WardName}</Option>)}
          </Select>
          {guestErrors.idPhuongXa && <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{guestErrors.idPhuongXa}</div>}
        </div>
        <div className="full-width">
          <Input
            placeholder="Địa chỉ cụ thể (Số nhà, tên đường...)"
            size="large"
            value={guestForm.diaChiChiTiet}
            onChange={(e) => {
              setGuestForm({ ...guestForm, diaChiChiTiet: e.target.value });
              if (guestErrors.diaChiChiTiet) setGuestErrors({ ...guestErrors, diaChiChiTiet: undefined });
            }}
            status={guestErrors.diaChiChiTiet ? 'error' : undefined}
          />
          {guestErrors.diaChiChiTiet && <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{guestErrors.diaChiChiTiet}</div>}
        </div>
      </div>

      <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" className="note-input" value={guestForm.ghiChu} onChange={(e) => setGuestForm({ ...guestForm, ghiChu: e.target.value })} style={{ marginTop: 16 }} />
    </div>
  );

  const handleCheckout = async () => {
    if (!item) {
      message.error('Không có sản phẩm để mua ngay.');
      return;
    }

    let hoTen, soDienThoai, email, diaChiGiaoHang;
    if (isLoggedIn) {
      if (!selectedAddressId) { message.warning('Vui lòng chọn địa chỉ giao hàng!'); return; }
      const addr = addresses.find((a) => a.id === selectedAddressId);
      if (!addr) { message.error('Không tìm thấy địa chỉ đã chọn!'); return; }
      hoTen = addr.hoTen || profile?.hoTen || '';
      soDienThoai = addr.soDienThoai || profile?.soDienThoai || '';
      email = profile?.email || '';
      diaChiGiaoHang = `${addr.diaChiChiTiet}, ${addr.phuongXa}, ${addr.quanHuyen}, ${addr.tinhThanh}`;
    } else {
      if (!validateGuestForm()) return;
      hoTen = guestForm.hoTen;
      soDienThoai = guestForm.soDienThoai;
      email = guestForm.email || '';
      const tenPhuongXa = wardsList.find((w) => String(w.WardCode) === String(guestForm.idPhuongXa))?.WardName || '';
      const tenQuanHuyen = districtsList.find((d) => d.DistrictID === guestForm.idQuanHuyen)?.DistrictName || '';
      const tenTinhThanh = provincesList.find((p) => p.ProvinceID === guestForm.idTinhThanh)?.ProvinceName || '';
      diaChiGiaoHang = [guestForm.diaChiChiTiet, tenPhuongXa, tenQuanHuyen, tenTinhThanh].filter(Boolean).join(', ');
    }

    const maHoaDon = generateMaHoaDon();
    const phuongThuc = paymentMethod === 'cod' ? 'TIEN_MAT' : 'CHUYEN_KHOAN';
    const ngayNhan = formatDdMmYyyyForBE(leadTime);

    const payload = {
      ...(isLoggedIn && profile?.id ? { idTaiKhoan: profile.id } : {}),
      idMaGiamGia: selectedVoucherId || null,
      maHoaDon,
      hoTen,
      soDienThoai,
      ngayNhan,
      phuongThucThanhToan: phuongThuc,
      email,
      diaChiGiaoHang,
      phiShip: shippingFeeRounded,
      ghiChu: isLoggedIn ? ghiChu : (guestForm.ghiChu || ''),
      chiTiets: [{ idSach: item.idSach, soLuong: item.soLuong, donGia: item.giaBan }],
    };

    Modal.confirm({
      title: 'Xác nhận đặt hàng',
      content: 'Bạn có chắc chắn muốn đặt đơn hàng này không?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        if (checkoutOnceRef.current) return;
        checkoutOnceRef.current = true;
        try {
          setOrdering(true);
          await createHoaDon(payload);

          if (paymentMethod === 'cod') {
            message.success('Đặt hàng thành công!');
            setTimeout(() => navigate('/order-success', { state: { isLoggedIn, maHoaDon } }), 800);
            return;
          }

          const vnpAmount = String(finalTotal || 0);
          if (!finalTotal || finalTotal <= 0) throw new Error('Tổng tiền không hợp lệ để thanh toán VNPay');

          const paymentUrl = await createVnpayPaymentUrl({
            vnp_TxnRef: String(maHoaDon),
            vnp_Amount: vnpAmount,
            vnp_OrderInfo: `Thanh toan cho don ${maHoaDon}`,
            userType: isLoggedIn ? 'USER' : 'GUEST',
          });

          if (!paymentUrl || typeof paymentUrl !== 'string') throw new Error('Không nhận được URL thanh toán VNPay');
          window.location.href = paymentUrl;
        } catch (e) {
          checkoutOnceRef.current = false;
          message.error(e?.message || 'Đặt hàng thất bại, vui lòng thử lại!');
        } finally {
          setOrdering(false);
        }
      },
    });
  };

  if (loadingItem) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-section">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-section" style={{ color: '#000' }}>
            Không có sản phẩm để mua ngay. <Link to="/products">Quay lại mua sắm</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-left">
          <h2 className="cart-page-title" style={{ textAlign: 'center' }}>Mua ngay</h2>

          <div className="cart-section section-products">
            <p style={{ color: 'black', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Sản phẩm</p>
            <Table columns={cartColumns} dataSource={[item]} rowKey="idSach" pagination={false} bordered className="cart-table" />
          </div>

          {isLoggedIn ? (
            <div className="cart-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 className="section-title" style={{ margin: 0 }}><EnvironmentOutlined /> Địa chỉ nhận hàng</h3>
                {addresses.length > 0 && <Button type="link" onClick={() => setIsAddressListOpen(true)}>Thay đổi</Button>}
              </div>
              <div>
                {selectedAddressId ? (() => {
                  const addr = addresses.find(a => a.id === selectedAddressId);
                  if (!addr) return null;
                  return (
                    <div style={{ padding: '12px 16px', border: '1px solid #e8e8e8', borderRadius: 8, backgroundColor: '#fafafa', color: '#000' }}>
                      <div style={{ marginBottom: 4 }}>
                        <b style={{ fontSize: 16, color: '#000' }}>{addr.hoTen || profile?.hoTen || 'N/A'}</b>
                        <span style={{ color: '#888', margin: '0 8px' }}>|</span>
                        <strong style={{ color: '#000' }}>{addr.soDienThoai || profile?.soDienThoai || 'N/A'}</strong>
                        {addr.macDinh && <Tag color="volcano" style={{ marginLeft: 12 }}>Mặc định</Tag>}
                      </div>
                      <p style={{ color: '#000', margin: '8px 0 0' }}>
                        <EnvironmentOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
                        {addr.diaChiChiTiet || 'N/A'}, {addr.phuongXa || 'N/A'}, {addr.quanHuyen || 'N/A'}, {addr.tinhThanh || 'N/A'}
                      </p>
                    </div>
                  );
                })() : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#000' }}>
                    Bạn chưa có địa chỉ nào. <Button type="link" onClick={() => navigate('/account/profile')}>Thêm địa chỉ trong tài khoản</Button>
                  </div>
                )}
              </div>
              <TextArea rows={3} placeholder="Nhập ghi chú (nếu có cho đơn hàng)" className="note-input" style={{ marginTop: 16 }} value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
            </div>
          ) : (
            renderGuestForm()
          )}

          <div className="cart-section">
            <h3 className="section-title">Thanh toán</h3>
            <div className="payment-methods">
              <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="payment-radio-group">
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

        <div className="cart-right">
          <div className="summary-section">
            <div className="promo-box">
              <div className="promo-header">
                <TagOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                <span>Sử dụng mã giảm giá</span>
              </div>
              <div className="promo-input">
                <Button size="large" style={{ width: '100%' }} onClick={() => setIsVoucherModalOpen(true)} disabled={vouchers.length === 0}>
                  {selectedVoucher
                    ? `${selectedVoucher.tenMaGiamGia} - Giảm ${selectedVoucher.giaTriGiam?.toLocaleString('vi-VN')}₫`
                    : (vouchers.length > 0 ? 'Chọn mã giảm giá' : 'Không có mã phù hợp')}
                </Button>
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div className="summary-row">
              <span className="sr-label">Tạm tính:</span>
              <span className="sr-value">{sumAmount.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="summary-row">
              <span className="sr-label">Phí giao hàng:</span>
              <span className="sr-value">{shippingFeeRounded > 0 ? shippingFeeRounded.toLocaleString('vi-VN') + '₫' : 'Miễn phí'}</span>
            </div>
            {leadTime && (
              <div className="summary-row" style={{ color: '#52c41a' }}>
                <span className="sr-label">Ngày nhận (Dự kiến):</span>
                <span className="sr-value">{leadTime}</span>
              </div>
            )}
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

            <div className="terms-checkbox">
              <Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}>
                Tôi đã đọc và đồng ý với <Link to="/terms">điều khoản và điều kiện</Link> của website
              </Checkbox>
            </div>

            <Button type="primary" size="large" className="btn-checkout-submit" block disabled={!termsAccepted} loading={ordering} onClick={handleCheckout}>
              Tiến hành đặt hàng
            </Button>
          </div>
        </div>
      </div>

      <Modal
        title="Chọn mã giảm giá"
        open={isVoucherModalOpen}
        onCancel={() => setIsVoucherModalOpen(false)}
        footer={[
          <Button key="clear" onClick={() => setSelectedVoucherId(null)} disabled={!selectedVoucherId}>Bỏ chọn</Button>,
          <Button key="ok" type="primary" onClick={() => setIsVoucherModalOpen(false)}>Xong</Button>,
        ]}
        width={420}
      >
        <div className="voucher-modal">
          {vouchers.length === 0 ? (
            <div style={{ padding: 16, color: '#666' }}>Không có mã giảm giá phù hợp với đơn hiện tại.</div>
          ) : (
            <Radio.Group value={selectedVoucherId} onChange={(e) => setSelectedVoucherId(e.target.value)} style={{ width: '100%' }}>
              <div className="voucher-list">
                {vouchers.map((v) => (
                  <label key={v.id} className={`voucher-item ${selectedVoucherId === v.id ? 'active' : ''}`}>
                    <div className="voucher-left">
                      <div className="voucher-title">
                        <span className="voucher-name">{v.tenMaGiamGia} - Giảm {v.giaTriGiam?.toLocaleString('vi-VN')}₫</span>
                      </div>
                      <div className="voucher-sub">
                        <span>Đơn tối thiểu: {v.tienToiThieu?.toLocaleString('vi-VN')}₫</span>
                      </div>
                      <div className="voucher-sub voucher-sub-muted">
                        <span>HSD: {v.ngayKetThuc ? new Date(v.ngayKetThuc).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="voucher-right">
                      <img className="voucher-img" src="https://cdn-icons-png.flaticon.com/512/879/879757.png" alt="voucher" />
                      <Radio value={v.id} />
                    </div>
                  </label>
                ))}
              </div>
            </Radio.Group>
          )}
        </div>
      </Modal>

      <Modal
        title="Địa chỉ của tôi"
        open={isAddressListOpen}
        onOk={() => setIsAddressListOpen(false)}
        onCancel={() => setIsAddressListOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsAddressListOpen(false)}>Hủy</Button>,
          <Button key="confirm" type="primary" onClick={() => setIsAddressListOpen(false)}>Xác nhận</Button>,
        ]}
        width={600}
      >
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <Radio.Group onChange={(e) => setSelectedAddressId(e.target.value)} value={selectedAddressId} style={{ width: '100%' }}>
            {addresses.map((addr) => (
              <div key={addr.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, padding: '16px', border: '1px solid #e8e8e8', borderRadius: 8, color: '#000' }}>
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start' }}>
                  <Radio value={addr.id} style={{ marginTop: 4, marginRight: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ marginBottom: 4 }}>
                        <b style={{ fontSize: 16, color: '#000' }}>{addr.hoTen || 'N/A'}</b>
                        <span style={{ color: '#888', margin: '0 8px' }}>|</span>
                        <span style={{ color: '#666', fontWeight: 500 }}>{addr.soDienThoai || 'N/A'}</span>
                      </div>
                      <div style={{ color: '#000', marginBottom: 8, lineHeight: '1.5', wordBreak: 'break-word' }}>
                        <EnvironmentOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
                        {addr.diaChiChiTiet || 'N/A'}, {addr.phuongXa || 'N/A'}, {addr.quanHuyen || 'N/A'}, {addr.tinhThanh || 'N/A'}
                      </div>
                      {addr.macDinh && <Tag color="volcano">Mặc định</Tag>}
                    </div>
                  </Radio>
                </div>
              </div>
            ))}
          </Radio.Group>
        </div>
      </Modal>
    </div>
  );
}
