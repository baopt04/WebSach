import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Input,
  Select,
  Radio,
  Checkbox,
  Button,
  InputNumber,
  Divider,
  message,
  Modal,
  Tag,
  Table
} from 'antd';
import {
  DeleteOutlined,
  TagOutlined,
  PlusOutlined,
  EditOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { getCartDetails, updateCartItem, removeCartItem } from '../../services/client/CartCustomerService';
import { getEligibleVouchers } from '../../services/client/VoucherCustomerService';
import { getMyAddresses, createMyAddress, updateMyAddress, getMyProfile } from '../../services/client/ProfileCustomer';
import { getProvinces, getDistricts, getWards, calculateShippingFee, calculateLeadTime } from '../../services/GhnApi';
import { createHoaDon } from '../../services/client/HoaDonCustomerService';
import { createVnpayPaymentUrl } from '../../services/client/VNPayCustomerService';
import { useCart } from '../../context/CartContext';
import './CartPage.css';

const { Option } = Select;
const { TextArea } = Input;

const CartPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [termsAccepted, setTermsAccepted] = useState(true);

  const isLoggedIn = !!localStorage.getItem("token");
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [errorsAddress, setErrorsAddress] = useState({});
  const [addressForm, setAddressForm] = useState({
    id: null,
    hoTen: '',
    soDienThoai: '',
    idTinhThanh: null,
    tinhThanh: '',
    idQuanHuyen: null,
    quanHuyen: '',
    idPhuongXa: '',
    phuongXa: '',
    diaChiChiTiet: '',
  });

  const [provincesList, setProvincesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [wardsList, setWardsList] = useState([]);

  const [guestForm, setGuestForm] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    idTinhThanh: null,
    idQuanHuyen: null,
    idPhuongXa: null,
    diaChiChiTiet: '',
    ghiChu: ''
  });
  const [guestErrors, setGuestErrors] = useState({});

  const [shippingFee, setShippingFee] = useState(0);
  const [leadTime, setLeadTime] = useState(null);
  const [ghiChu, setGhiChu] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const navigate = useNavigate();
  const { fetchCartCount } = useCart();
  const checkoutOnceRef = useRef(false);

  const generateMaHoaDon = () => {
    const random5 = Math.floor(10000 + Math.random() * 90000);
    return `HD${random5}`;
  };

  const formatDdMmYyyy = (viDate) => {
    if (!viDate) return null;
    const parts = String(viDate).split('/');
    if (parts.length !== 3) return null;
    const dd = String(parts[0]).padStart(2, '0');
    const mm = String(parts[1]).padStart(2, '0');
    const yyyy = String(parts[2]);
    return `${dd}-${mm}-${yyyy}`;
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

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      if (isLoggedIn) {
        const data = await getCartDetails();
        if (data && data.chiTietList) {
          setItems(data.chiTietList);
        } else {
          setItems([]);
        }
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setItems(guestCart);
      }
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddressesAndProvinces = async () => {
    try {
      if (isLoggedIn) {
        const addrRes = await getMyAddresses();
        console.log("Check address", addrRes);

        const profileRes = await getMyProfile();
        setProfile(profileRes);
        const sorted = [...addrRes].sort((a, b) => {
          if (a.macDinh && !b.macDinh) return -1;
          if (!a.macDinh && b.macDinh) return 1;
          return 0;
        });
        setAddresses(sorted);
        if (sorted.length > 0 && !selectedAddressId) {
          setSelectedAddressId(sorted[0].id);
        }
      }
      const provRes = await getProvinces();
      setProvincesList(provRes.data || []);
    } catch (error) {
      console.error("Lỗi load địa chỉ/tỉnh thành:", error);
    }
  };

  useEffect(() => {
    fetchCartItems();
    fetchAddressesAndProvinces();
  }, [isLoggedIn]);

  useEffect(() => {
    setSelectedRowKeys((prev) => {
      const ids = items.map((i) => i.idGioHangChiTiet);
      const next = prev.filter((k) => ids.includes(k));
      ids.forEach((id) => {
        if (!next.includes(id)) next.push(id);
      });
      return next;
    });
  }, [items]);

  const selectedItems = useMemo(
    () => items.filter((i) => selectedRowKeys.includes(i.idGioHangChiTiet)),
    [items, selectedRowKeys]
  );

  const sumAmount = selectedItems.reduce((acc, obj) => acc + (obj.giaBan * obj.soLuong), 0);

  /** Làm tròn phí ship xuống bội số 1.000 gần nhất (30.023 → 30.000) */
  const shippingFeeRounded = useMemo(
    () => Math.floor((shippingFee || 0) / 1000) * 1000,
    [shippingFee]
  );

  useEffect(() => {
    const fetchVouchers = async () => {
      if (sumAmount > 0) {
        try {
          const res = await getEligibleVouchers(sumAmount);
          const list = res || [];
          setVouchers(list);
          if (selectedVoucherId && !list.find(v => v.id === selectedVoucherId)) {
            setSelectedVoucherId(null);
          }
        } catch (error) {
          console.error("Lỗi lấy mã giảm giá:", error);
          setVouchers([]);
        }
      } else {
        setVouchers([]);
        setSelectedVoucherId(null);
      }
    };
    fetchVouchers();
  }, [sumAmount]);

  useEffect(() => {
    const calculateGHN = async (districtId, wardCode) => {
      if (!districtId || !wardCode) return;
      try {
        const feeRes = await calculateShippingFee({
          toDistrictId: districtId,
          toWardCode: wardCode,
          weight: Math.max(selectedRowKeys.length, 1) * 300,
        });
        if (feeRes?.data?.total) {
          setShippingFee(Math.round(feeRes.data.total));
        } else {
          setShippingFee(0);
        }

        const timeRes = await calculateLeadTime({
          toDistrictId: districtId,
          toWardCode: wardCode,
        });
        if (timeRes?.data?.leadtime) {
          const d = new Date(timeRes.data.leadtime * 1000);
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          setLeadTime(`${dd}/${mm}/${yyyy}`);
        } else {
          setLeadTime(null);
        }
      } catch (err) {
        console.error("Lỗi GHN:", err);
        setShippingFee(0);
        setLeadTime(null);
      }
    };

    if (isLoggedIn && selectedAddressId) {
      const addr = addresses.find(a => a.id === selectedAddressId);
      if (addr && addr.idQuanHuyen && addr.idPhuongXa) {
        calculateGHN(addr.idQuanHuyen, addr.idPhuongXa);
      }
    } else if (!isLoggedIn && guestForm.idQuanHuyen && guestForm.idPhuongXa) {
      calculateGHN(guestForm.idQuanHuyen, guestForm.idPhuongXa);
    } else {
      setShippingFee(0);
      setLeadTime(null);
    }
  }, [selectedAddressId, addresses, guestForm.idQuanHuyen, guestForm.idPhuongXa, isLoggedIn, items.length, selectedRowKeys]);

  const selectedVoucher = vouchers.find((v) => v.id === selectedVoucherId);
  const discountAmount = selectedVoucher ? selectedVoucher.giaTriGiam : 0;
  const finalTotal =
    sumAmount + shippingFeeRounded - discountAmount > 0
      ? sumAmount + shippingFeeRounded - discountAmount
      : 0;

  const handleUpdateQty = async (idGioHangChiTiet, val) => {
    if (val < 1) return;
    if (!isLoggedIn) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const updated = guestCart.map(item =>
        item.idGioHangChiTiet === idGioHangChiTiet ? { ...item, soLuong: val } : item
      );
      localStorage.setItem('guestCart', JSON.stringify(updated));
      setItems(updated);
      return;
    }
    try {
      await updateCartItem(idGioHangChiTiet, val);
      message.success("Cập nhật số lượng thành công");
      fetchCartItems();
      fetchCartCount();
    } catch (error) {
      console.error(error);
      message.error(error.message || "Lỗi cập nhật số lượng");
    }
  };

  const handleRemoveItem = async (idGioHangChiTiet) => {
    if (!isLoggedIn) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const updated = guestCart.filter(item => item.idGioHangChiTiet !== idGioHangChiTiet);
      localStorage.setItem('guestCart', JSON.stringify(updated));
      setItems(updated);
      return;
    }
    try {
      await removeCartItem(idGioHangChiTiet);
      message.success("Xóa sản phẩm khỏi giỏ hàng thành công");
      fetchCartItems();
      fetchCartCount();
    } catch (error) {
      console.error(error);
      message.error("Lỗi xóa sản phẩm");
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) { message.warning('Giỏ hàng đang trống!'); return; }
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sản phẩm để đặt hàng!');
      return;
    }

    let hoTen, soDienThoai, email, diaChiGiaoHang;

    if (isLoggedIn) {
      if (!selectedAddressId) { message.warning('Vui lòng chọn địa chỉ giao hàng!'); return; }
      const addr = addresses.find(a => a.id === selectedAddressId);
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

      const tenPhuongXa = wardsList.find(w => String(w.WardCode) === String(guestForm.idPhuongXa))?.WardName || '';
      const tenQuanHuyen = districtsList.find(d => d.DistrictID === guestForm.idQuanHuyen)?.DistrictName || '';
      const tenTinhThanh = provincesList.find(p => p.ProvinceID === guestForm.idTinhThanh)?.ProvinceName || '';

      const parts = [guestForm.diaChiChiTiet, tenPhuongXa, tenQuanHuyen, tenTinhThanh].filter(Boolean);
      diaChiGiaoHang = parts.join(', ');
    }

    const maHoaDon = generateMaHoaDon();
    const phuongThuc = paymentMethod === 'cod' ? 'TIEN_MAT' : 'CHUYEN_KHOAN';
    const ngayNhan = formatDdMmYyyy(leadTime);

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
      chiTiets: selectedItems.map(item => ({
        idSach: item.idSach,
        soLuong: item.soLuong,
        donGia: item.giaBan,
      })),
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
            if (isLoggedIn) {
              await fetchCartItems();
              await fetchCartCount();
            } else {
              const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
              const remain = guestCart.filter((item) => !selectedRowKeys.includes(item.idGioHangChiTiet));
              localStorage.setItem('guestCart', JSON.stringify(remain));
              setItems(remain);
              fetchCartCount();
            }
            message.success('Đặt hàng thành công!');

            setTimeout(() => {
              navigate('/order-success', { state: { isLoggedIn, maHoaDon } });
            }, 800);
            return;
          }

          const vnpAmount = String(finalTotal || 0);
          if (!finalTotal || finalTotal <= 0) {
            throw new Error('Tổng tiền không hợp lệ để thanh toán VNPay');
          }

          const paymentUrl = await createVnpayPaymentUrl({
            vnp_TxnRef: String(maHoaDon),
            vnp_Amount: vnpAmount,
            vnp_OrderInfo: `Thanh toan cho don ${maHoaDon}`,
            userType: isLoggedIn ? 'USER' : 'GUEST',
          });

          if (!paymentUrl || typeof paymentUrl !== 'string') {
            throw new Error('Không nhận được URL thanh toán VNPay');
          }

          window.location.href = paymentUrl;
        } catch (error) {
          checkoutOnceRef.current = false;
          console.error(error);
          message.error(error?.message || 'Đặt hàng thất bại, vui lòng thử lại!');
        } finally {
          setOrdering(false);
        }
      },
    });
  };

  const cartColumns = [
    {
      title: 'STT',
      key: 'index',
      align: 'center',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên sản phẩm',
      key: 'tenSach',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={record.hinhAnh || 'https://via.placeholder.com/100x140?text=No+Image'}
            alt={record.tenSach}
            style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px' }}
          />
          <Link to={`/products/${record.idSach}`} style={{ color: '#000', fontWeight: 500 }}>
            {record.tenSach}
          </Link>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      key: 'soLuong',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.soLuong}
          onChange={(val) => handleUpdateQty(record.idGioHangChiTiet, val)}
          style={{ width: '60px' }}
        />
      ),
    },
    {
      title: 'Giá',
      key: 'giaBan',
      align: 'right',
      width: 120,
      render: (_, record) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          {record.giaBan?.toLocaleString('vi-VN')}₫
        </span>
      ),
    },
    {
      title: 'Xóa',
      key: 'remove',
      align: 'center',
      width: 60,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.idGioHangChiTiet)}
        />
      ),
    },
  ];

  const openAddAddressModal = () => {
    setAddressForm({
      id: null,
      hoTen: '',
      soDienThoai: '',
      idTinhThanh: null,
      tinhThanh: '',
      idQuanHuyen: null,
      quanHuyen: '',
      idPhuongXa: '',
      phuongXa: '',
      diaChiChiTiet: '',
    });
    setDistrictsList([]);
    setWardsList([]);
    setIsListModalOpen(false);
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = async (addr) => {
    setAddressForm({
      id: addr.id,
      hoTen: addr.hoTen || '',
      soDienThoai: addr.soDienThoai || '',
      idTinhThanh: addr.idTinhThanh,
      tinhThanh: addr.tinhThanh || '',
      idQuanHuyen: addr.idQuanHuyen,
      quanHuyen: addr.quanHuyen || '',
      idPhuongXa: String(addr.idPhuongXa),
      phuongXa: addr.phuongXa || '',
      diaChiChiTiet: addr.diaChiChiTiet || '',
    });
    try {
      if (addr.idTinhThanh) {
        const dRes = await getDistricts(addr.idTinhThanh);
        setDistrictsList(dRes.data || []);
      }
      if (addr.idQuanHuyen) {
        const wRes = await getWards(addr.idQuanHuyen);
        setWardsList(wRes.data || []);
      }
    } catch (error) {
      console.error(error);
    }
    setIsListModalOpen(false);
    setIsAddressModalOpen(true);
  };

  const validateAddress = () => {
    const newErrors = {};
    if (!addressForm.hoTen) newErrors.hoTen = 'Nhập họ tên';
    if (!addressForm.soDienThoai) newErrors.soDienThoai = 'Nhập số điện thoại';
    if (addressForm.soDienThoai && !/^\d{9,11}$/.test(addressForm.soDienThoai)) newErrors.soDienThoai = 'Số điện thoại không hợp lệ';
    if (!addressForm.idTinhThanh) newErrors.idTinhThanh = 'Chọn tỉnh/thành';
    if (!addressForm.idQuanHuyen) newErrors.idQuanHuyen = 'Chọn quận/huyện';
    if (!addressForm.idPhuongXa) newErrors.idPhuongXa = 'Chọn phường/xã';
    if (!addressForm.diaChiChiTiet) newErrors.diaChiChiTiet = 'Nhập địa chỉ cụ thể';

    setErrorsAddress(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateAddress()) return;
    try {
      if (addressForm.id) {
        await updateMyAddress(addressForm.id, addressForm);
        message.success("Cập nhật địa chỉ thành công!");
      } else {
        await createMyAddress(addressForm);
        message.success("Thêm địa chỉ thành công!");
      }
      setIsAddressModalOpen(false);
      setIsListModalOpen(true);
      fetchAddressesAndProvinces();
    } catch (error) {
      console.error(error);
      message.error("Lỗi lưu địa chỉ");
    }
  };

  const renderGuestForm = () => (
    <div className="cart-section">
      <h3 className="section-title">Thông tin giao hàng</h3>
      <div className="form-grid">
        <div>
          <Input
            placeholder="Họ và tên (bắt buộc)"
            size="large"
            value={guestForm.hoTen}
            onChange={e => {
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
            onChange={e => {
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
            onChange={e => {
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
            style={{ width: "100%" }}
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
            style={{ width: "100%" }}
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
            style={{ width: "100%" }}

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
            onChange={e => {
              setGuestForm({ ...guestForm, diaChiChiTiet: e.target.value });
              if (guestErrors.diaChiChiTiet) setGuestErrors({ ...guestErrors, diaChiChiTiet: undefined });
            }}
            status={guestErrors.diaChiChiTiet ? 'error' : undefined}
          />
          {guestErrors.diaChiChiTiet && <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{guestErrors.diaChiChiTiet}</div>}
        </div>
      </div>
      <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" className="note-input" value={guestForm.ghiChu} onChange={e => setGuestForm({ ...guestForm, ghiChu: e.target.value })} style={{ marginTop: 16 }} />
    </div>
  );

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-left">
          <h2 className="cart-page-title" style={{ textAlign: 'center' }}>Giỏ hàng</h2>
          <div className="cart-section section-products">
            {loading ? (
              <p>Đang tải giỏ hàng...</p>
            ) : items.length === 0 ? (
              <p>Giỏ hàng trống. <Link to="/products">Tiếp tục mua sắm</Link></p>
            ) : (
              <div className="cart-items-list">
                <p style={{ color: 'black', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Thông tin đơn hàng:</p>
                <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>Chọn sản phẩm cần mua (có thể bỏ chọn những món không đặt trong lần này).</p>
                <Table
                  columns={cartColumns}
                  dataSource={items}
                  rowKey="idGioHangChiTiet"
                  rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                  }}
                  pagination={false}
                  bordered
                  className="cart-table"
                />
              </div>
            )}
          </div>

          {isLoggedIn ? (
            <div className="cart-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 className="section-title" style={{ margin: 0 }}><EnvironmentOutlined /> Địa chỉ nhận hàng</h3>
                {addresses.length > 0 && (
                  <Button type="link" onClick={() => setIsListModalOpen(true)}>Thay đổi</Button>
                )}
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
                    Bạn chưa có địa chỉ nào. <Button type="link" onClick={openAddAddressModal}>Thêm địa chỉ giao hàng</Button>
                  </div>
                )}
              </div>
              <TextArea
                rows={3}
                placeholder="Nhập ghi chú (nếu có cho đơn hàng)"
                className="note-input"
                style={{ marginTop: 16 }}
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
              />
            </div>
          ) : renderGuestForm()}

          <div className="cart-section">
            <h3 className="section-title">Thanh toán</h3>
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

        <div className="cart-right">
          <div className="summary-section">
            <div className="promo-box">
              <div className="promo-header">
                <TagOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                <span>Sử dụng mã giảm giá</span>
              </div>
              <div className="promo-input">
                <Button
                  size="large"
                  style={{ width: '100%' }}
                  onClick={() => setIsVoucherModalOpen(true)}
                  disabled={vouchers.length === 0}
                >
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
              <Checkbox
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              >
                Tôi đã đọc và đồng ý với <Link to="/terms">điều khoản và điều kiện</Link> của website
              </Checkbox>
            </div>

            <Button
              type="primary"
              size="large"
              className="btn-checkout-submit"
              block
              disabled={!termsAccepted || items.length === 0 || selectedRowKeys.length === 0}
              loading={ordering}
              onClick={handleCheckout}
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

      <Modal
        title="Chọn mã giảm giá"
        open={isVoucherModalOpen}

        onCancel={() => setIsVoucherModalOpen(false)}
        footer={[
          <Button key="clear" onClick={() => setSelectedVoucherId(null)} disabled={!selectedVoucherId}>
            Bỏ chọn
          </Button>,
          <Button key="ok" type="primary" onClick={() => setIsVoucherModalOpen(false)}>
            Xong
          </Button>,
        ]}
        width={420}
      >
        <div className="voucher-modal">
          {vouchers.length === 0 ? (
            <div style={{ padding: 16, color: '#666' }}>Không có mã giảm giá phù hợp với đơn hiện tại.</div>
          ) : (
            <Radio.Group
              value={selectedVoucherId}
              onChange={(e) => setSelectedVoucherId(e.target.value)}
              style={{ width: '100%' }}
            >
              <div className="voucher-list">
                {vouchers.map((v) => (
                  <label key={v.id} className={`voucher-item ${selectedVoucherId === v.id ? 'active' : ''}`}>
                    <div className="voucher-left">

                      <div className="voucher-title">
                        <span className="voucher-name">{v.tenMaGiamGia} - Giảm {v.giaTriGiam?.toLocaleString('vi-VN')}₫ </span>
                      </div>
                      <div className="voucher-sub">
                        <span>Đơn tối thiểu: {v.tienToiThieu?.toLocaleString('vi-VN')}₫</span>
                      </div>
                      <div className="voucher-sub voucher-sub-muted">
                        <span>HSD: {v.ngayKetThuc ? new Date(v.ngayKetThuc).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="voucher-right">
                      <img
                        className="voucher-img"
                        src="https://cdn-icons-png.flaticon.com/512/879/879757.png"
                        alt="voucher"
                      />
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
        open={isListModalOpen}
        onOk={() => setIsListModalOpen(false)}
        onCancel={() => setIsListModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsListModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="confirm" type="primary" onClick={() => setIsListModalOpen(false)}>
            Xác nhận
          </Button>,
        ]}
        width={600}
      >
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <Radio.Group onChange={(e) => setSelectedAddressId(e.target.value)} value={selectedAddressId} style={{ width: '100%' }}>
            {addresses.map(addr => (
              <div key={addr.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, padding: '16px', border: '1px solid #e8e8e8', borderRadius: 8, color: '#000' }}>
                <div style={{ width: '75%', display: 'flex', alignItems: 'flex-start' }}>
                  <Radio value={addr.id} style={{ marginTop: 4, marginRight: 12 }} >
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
                <div style={{ width: '25%', textAlign: 'right', flexShrink: 0 }}>
                  <Button type="link" onClick={() => openEditAddressModal(addr)} style={{ padding: 0 }}>Cập nhật</Button>
                </div>
              </div>
            ))}
          </Radio.Group>
        </div>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={openAddAddressModal}
          style={{ width: '100%', marginTop: 8 }}
        >
          Thêm địa chỉ mới
        </Button>
      </Modal>

      <Modal
        title={addressForm.id ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
        open={isAddressModalOpen}
        onOk={handleSaveAddress}
        onCancel={() => {
          setIsAddressModalOpen(false);
          setIsListModalOpen(true);
        }}
        okText="Lưu"
        cancelText="Hủy"
        width={500}
      >
        <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Input placeholder="Họ và tên" value={addressForm.hoTen} onChange={e => setAddressForm({ ...addressForm, hoTen: e.target.value })} />
            {errorsAddress.hoTen && <div style={{ color: 'red', marginTop: 4 }}>{errorsAddress.hoTen}</div>}
          </div>
          <div>
            <Input placeholder="Số điện thoại" value={addressForm.soDienThoai} onChange={e => setAddressForm({ ...addressForm, soDienThoai: e.target.value })} />
            {errorsAddress.soDienThoai && <div style={{ color: 'red', marginTop: 4 }}>{errorsAddress.soDienThoai}</div>}
          </div>
          <div>
            <Select
              placeholder="Chọn Tỉnh/Thành phố" style={{ width: '100%' }} value={addressForm.idTinhThanh}
              onChange={async (val, option) => {
                setAddressForm({ ...addressForm, idTinhThanh: val, tinhThanh: option.children, idQuanHuyen: null, quanHuyen: '', idPhuongXa: '', phuongXa: '' });
                const res = await getDistricts(val);
                setDistrictsList(res.data || []);
                setWardsList([]);
              }}
              showSearch
            >
              {provincesList.map(p => <Option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</Option>)}
            </Select>
            {errorsAddress.idTinhThanh && <div style={{ color: 'red', marginTop: 4 }}>{errorsAddress.idTinhThanh}</div>}
          </div>
          <div>
            <Select
              placeholder="Chọn Quận/Huyện" style={{ width: '100%' }} value={addressForm.idQuanHuyen}
              onChange={async (val, option) => {
                setAddressForm({ ...addressForm, idQuanHuyen: val, quanHuyen: option.children, idPhuongXa: '', phuongXa: '' });
                const res = await getWards(val);
                setWardsList(res.data || []);
              }}
              disabled={!addressForm.idTinhThanh} showSearch
            >
              {districtsList.map(d => <Option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</Option>)}
            </Select>
            {errorsAddress.idQuanHuyen && <div style={{ color: 'red', marginTop: 4 }}>{errorsAddress.idQuanHuyen}</div>}
          </div>
          <div>
            <Select
              placeholder="Chọn Phường/Xã" style={{ width: '100%' }} value={addressForm.idPhuongXa}
              onChange={(val, option) => setAddressForm({ ...addressForm, idPhuongXa: val, phuongXa: option.children })}
              disabled={!addressForm.idQuanHuyen} showSearch
            >
              {wardsList.map(w => <Option key={w.WardCode} value={w.WardCode}>{w.WardName}</Option>)}
            </Select>
            {errorsAddress.idPhuongXa && <div style={{ color: 'red', marginTop: 4 }}>{errorsAddress.idPhuongXa}</div>}
          </div>
          <div>
            <Input.TextArea placeholder="Địa chỉ cụ thể" rows={3} value={addressForm.diaChiChiTiet} onChange={e => setAddressForm({ ...addressForm, diaChiChiTiet: e.target.value })} />
            {errorsAddress.diaChiChiTiet && <div style={{ color: 'red', marginTop: 4 }}>{errorsAddress.diaChiChiTiet}</div>}
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default CartPage;