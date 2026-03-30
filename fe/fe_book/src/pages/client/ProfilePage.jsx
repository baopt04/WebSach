import { useState, useEffect } from 'react';
import { Button, Tag, Divider, Input, Modal, Select, message, Spin, DatePicker, Radio } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatDate } from '../../utils/format';

import {
  getMyProfile,
  updateMyProfile,
  getMyAddresses,
  createMyAddress,
  updateMyAddress,
  deleteMyAddress,
  setDefaultAddress
} from '../../services/client/ProfileCustomer';
import { getProvinces, getDistricts, getWards } from '../../services/GhnApi';
import dayjs from 'dayjs';
import './ProfilePage.css';

const { Option } = Select;
const { confirm } = Modal;

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);


  const [profileForm, setProfileForm] = useState({
    hoTen: '',
    soDienThoai: '',
    gioiTinh: true,
    ngaySinh: null,
  });

  const [formErrors, setFormErrors] = useState({});
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

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, addrRes, provRes] = await Promise.all([
        getMyProfile(),
        getMyAddresses(),
        getProvinces()
      ]);


      localStorage.setItem("hoTen", profileRes.hoTen);
      localStorage.setItem("soDienThoai", profileRes.soDienThoai);
      localStorage.setItem("email", profileRes.email);
      localStorage.setItem("gioiTinh", profileRes.gioiTinh);
      localStorage.setItem("ngaySinh", profileRes.ngaySinh);
      setProfile(profileRes);
      const sortedAddresses = [...addrRes].sort((a, b) => {
        if (a.macDinh && !b.macDinh) return -1;
        if (!a.macDinh && b.macDinh) return 1;
        return 0;
      });
      setAddresses(sortedAddresses);
      setProvinces(provRes.data || []);

    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải dữ liệu trang cá nhân!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openProfileModal = () => {
    setProfileForm({
      hoTen: profile?.hoTen || '',
      soDienThoai: profile?.soDienThoai || '',
      gioiTinh: profile?.gioiTinh ?? true,
      ngaySinh: profile?.ngaySinh ? dayjs(profile.ngaySinh, 'DD-MM-YYYY') : null,
    });
    setIsProfileModalOpen(true);
  };

  const validateProfile = () => {
    const errors = {};

    if (!profileForm.hoTen || profileForm.hoTen.trim().length < 5) {
      errors.hoTen = 'Họ tên phải có ít nhất 5 ký tự';
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!profileForm.soDienThoai) {
      errors.soDienThoai = 'Vui lòng nhập số điện thoại';
    } else if (!phoneRegex.test(profileForm.soDienThoai)) {
      errors.soDienThoai = 'Số điện thoại không hợp lệ';
    }

    if (profileForm.gioiTinh === undefined || profileForm.gioiTinh === null) {
      errors.gioiTinh = 'Vui lòng chọn giới tính';
    }

    if (!profileForm.ngaySinh) {
      errors.ngaySinh = 'Vui lòng chọn ngày sinh';
    } else {
      const today = dayjs();
      const age = today.diff(profileForm.ngaySinh, 'year');
      if (age < 18) {
        errors.ngaySinh = 'Bạn phải đủ 18 tuổi';
      }
    }

    return errors;
  };
  const handleUpdateProfile = async () => {
    const errors = validateProfile();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    try {
      const payload = {
        hoTen: profileForm.hoTen,
        soDienThoai: profileForm.soDienThoai,
        gioiTinh: profileForm.gioiTinh,
        ngaySinh: profileForm.ngaySinh ? profileForm.ngaySinh.format('DD-MM-YYYY') : null
      };

      await updateMyProfile(payload);
      message.success("Cập nhật hồ sơ thành công!");
      setIsProfileModalOpen(false);
      setFormErrors({});
      fetchData();
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật hồ sơ.");
    }
  };

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
    setDistricts([]);
    setWards([]);
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
        setDistricts(dRes.data || []);
      }
      if (addr.idQuanHuyen) {
        const wRes = await getWards(addr.idQuanHuyen);
        setWards(wRes.data || []);
      }
    } catch (error) {
      console.error("Lỗi load GHN sub-data:", error);
    }

    setIsAddressModalOpen(true);
  };
  const validateAddress = () => {
    const newErrors = {};

    if (!addressForm.hoTen || addressForm.hoTen.trim() === '') {
      newErrors.hoTen = 'Vui lòng nhập họ tên người nhận';
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

    if (!addressForm.soDienThoai) {
      newErrors.soDienThoai = 'Vui lòng nhập số điện thoại';
    } else if (!phoneRegex.test(addressForm.soDienThoai)) {
      newErrors.soDienThoai = 'Số điện thoại không hợp lệ';
    }
    if (!addressForm.diaChiChiTiet || addressForm.diaChiChiTiet.trim() === '') {
      newErrors.diaChiChiTiet = 'Vui lòng nhập chi tiết địa chỉ';
    }
    if (!addressForm.idTinhThanh) {
      newErrors.idTinhThanh = 'Vui lòng chọn tỉnh/thành phố';
    }
    if (!addressForm.idQuanHuyen) {
      newErrors.idQuanHuyen = 'Vui lòng chọn quận/huyện';
    }
    if (!addressForm.idPhuongXa) {
      newErrors.idPhuongXa = 'Vui lòng chọn phường/xã';
    }

    setErrorsAddress(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const resetAddressForm = () => {
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
    setErrorsAddress({});
  };
  const handleSaveAddress = async () => {
    if (!validateAddress()) return;

    try {
      if (addressForm.id) {
        confirm({
          title: 'Cập nhật địa chỉ',
          content: 'Bạn có chắc chắn muốn cập nhật địa chỉ này?',
          okText: 'Cập nhật',
          cancelText: 'Hủy',
          onOk: async () => {
            await updateMyAddress(addressForm.id, addressForm);
            message.success("Cập nhật địa chỉ thành công!");
            setIsAddressModalOpen(false);
            fetchData();
          }
        });
      } else {
        confirm({
          title: 'Thêm địa chỉ',
          content: 'Bạn có chắc chắn muốn thêm địa chỉ này?',
          okText: 'Thêm',
          cancelText: 'Hủy',
          onOk: async () => {
            await createMyAddress(addressForm);
            message.success("Thêm địa chỉ thành công!");
            setIsAddressModalOpen(false);
            fetchData();
          }
        });
      }
      setIsAddressModalOpen(false);
      fetchData();
    } catch (error) {
      message.error("Lỗi khi lưu địa chỉ.");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      message.success("Đã đặt làm địa chỉ mặc định.");
      fetchData();
    } catch (error) {
      message.error("Lỗi khi đặt mặc định.");
    }
  };

  const handleDeleteAddress = (id) => {
    confirm({
      title: 'Xóa địa chỉ',
      content: 'Bạn có chắc chắn muốn xóa địa chỉ này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await deleteMyAddress(id);
          message.success("Xóa địa chỉ thành công.");
          fetchData();
        } catch (error) {
          message.error("Lỗi khi xóa địa chỉ.");
        }
      }
    });
  };

  const handleProvinceChange = async (value, option) => {
    setAddressForm(prev => ({
      ...prev,
      idTinhThanh: value,
      tinhThanh: option.children,
      idQuanHuyen: null,
      quanHuyen: '',
      idPhuongXa: '',
      phuongXa: ''
    }));
    setErrorsAddress(prev => ({ ...prev, idTinhThanh: '' }));
    setWards([]);
    try {
      const res = await getDistricts(value);
      setDistricts(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDistrictChange = async (value, option) => {
    setAddressForm(prev => ({
      ...prev,
      idQuanHuyen: value,
      quanHuyen: option.children,
      idPhuongXa: '',
      phuongXa: ''
    }));
    setErrorsAddress(prev => ({ ...prev, idQuanHuyen: '' }));
    try {
      const res = await getWards(value);
      setWards(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleWardChange = (value, option) => {
    setAddressForm(prev => ({
      ...prev,
      idPhuongXa: value,
      phuongXa: option.children
    }));
    setErrorsAddress(prev => ({ ...prev, idPhuongXa: '' }));
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  const defaultAddr = addresses.find(a => a.macDinh);
  const displayDefaultAddrTxt = defaultAddr
    ? `${defaultAddr.diaChiChiTiet}, ${defaultAddr.phuongXa}, ${defaultAddr.quanHuyen}, ${defaultAddr.tinhThanh}`
    : "Chưa có địa chỉ mặc định";

  return (
    <div className="profile-page">
      <h2 className="page-title">Hồ sơ của tôi</h2>
      <div className="profile-card">
        <div className="profile-row">
          <span className="pr-label">Họ và tên:</span>
          <span className="pr-value">{profile?.hoTen || 'Chưa cập nhật'}</span>
        </div>
        <div className="profile-row">
          <span className="pr-label">Email:</span>
          <span className="pr-value">{profile?.email || 'Chưa cập nhật'}</span>
        </div>
        <div className="profile-row">
          <span className="pr-label">Số điện thoại:</span>
          <span className="pr-value">{profile?.soDienThoai || 'Chưa cập nhật'}</span>
        </div>
        <div className="profile-row">
          <span className="pr-label">Giới tính:</span>
          <span className="pr-value">{profile?.gioiTinh ? "Nam" : "Nữ"}</span>
        </div>
        <div className="profile-row">
          <span className="pr-label">Ngày sinh:</span>
          <span className="pr-value">{profile?.ngaySinh}</span>
        </div>
        <div className="profile-row">
          <span className="pr-label">Địa chỉ liên hệ (Mặc định):</span>
          <span className="pr-value">{displayDefaultAddrTxt}</span>
        </div>
        <div className="profile-actions" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <Button type="primary" ghost onClick={openProfileModal}>Cập nhật hồ sơ</Button>
        </div>
      </div>

      <Divider style={{ margin: '32px 0 24px' }} />

      <div className="addresses-header">
        <h2 className="page-title">Danh sách địa chỉ</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddAddressModal}
        >
          Thêm địa chỉ mới
        </Button>
      </div>

      <div className="addresses-list">
        {addresses.length === 0 ? <p>Chưa có địa chỉ nào được lưu.</p> : null}
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`address-card ${addr.macDinh ? 'default' : ''}`}
          >
            <div className="ac-info">
              <div className="ac-name-phone">
                <strong>{addr.hoTen || profile?.hoTen}</strong>
                <span className="ac-split">|</span>
                <span className="ac-phone">{addr.soDienThoai || profile?.soDienThoai}</span>
              </div>
              <p className="ac-detail">{addr.diaChiChiTiet}, {addr.phuongXa}, {addr.quanHuyen}, {addr.tinhThanh}</p>
              {addr.macDinh && (
                <Tag color="blue" className="ac-tag">
                  Mặc định
                </Tag>
              )}
            </div>
            <div className="ac-actions">
              <div className="ac-btns">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  style={{
                    padding: 0,
                    color: '#1677ff',
                    fontWeight: 500,
                  }}
                  onClick={() => openEditAddressModal(addr)}
                >
                  Sửa
                </Button>
                <Button
                  type="link"
                  icon={<DeleteOutlined />}
                  style={{
                    padding: 0,
                    color: '#ff4d4f',
                    fontWeight: 500,
                  }}
                  onClick={() => handleDeleteAddress(addr.id)}
                >
                  Xóa
                </Button>
              </div>
              {!addr.macDinh && (
                <Button
                  className="btn-set-default"
                  onClick={() => handleSetDefault(addr.id)}
                >
                  Đặt mặc định
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        title="Cập nhật hồ sơ"
        open={isProfileModalOpen}
        onCancel={() => setIsProfileModalOpen(false)}
        onOk={handleUpdateProfile}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div><label>Họ và tên</label><Input value={profileForm.hoTen} onChange={e => { setProfileForm({ ...profileForm, hoTen: e.target.value }); setFormErrors(prev => ({ ...prev, hoTen: '' })); }} placeholder="Họ và tên" />
            {formErrors.hoTen && <div style={{ color: 'red' }}>{formErrors.hoTen}</div>}</div>
          <div><label>Số điện thoại</label><Input value={profileForm.soDienThoai} onChange={e => { setProfileForm({ ...profileForm, soDienThoai: e.target.value }); setFormErrors(prev => ({ ...prev, soDienThoai: '' })); }} placeholder="Số điện thoại" />
            {formErrors.soDienThoai && <div style={{ color: 'red' }}>{formErrors.soDienThoai}</div>}</div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Giới tính</label>
            <Radio.Group onChange={e => setProfileForm({ ...profileForm, gioiTinh: e.target.value })} value={profileForm.gioiTinh}>
              <Radio value={true}>Nam</Radio>
              <Radio value={false}>Nữ</Radio>
            </Radio.Group>
          </div>
          {formErrors.ngaySinh && <div style={{ color: 'red' }}>{formErrors.ngaySinh}</div>}
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Ngày sinh</label>
            <DatePicker
              style={{ width: '100%' }}
              format="DD-MM-YYYY"
              value={profileForm.ngaySinh}
              disabledDate={(current) => {
                return current && current > dayjs().subtract(18, 'year');
              }}
              onChange={date => setProfileForm({ ...profileForm, ngaySinh: date })}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title={addressForm.id ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
        open={isAddressModalOpen}
        onOk={handleSaveAddress}
        onCancel={() => {
          setIsAddressModalOpen(false);
          resetAddressForm();
        }}
        okText="Lưu"
        cancelText="Hủy"
      >
        <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            placeholder="Họ và tên "
            value={addressForm.hoTen}
            onChange={e => { setAddressForm({ ...addressForm, hoTen: e.target.value }); setErrorsAddress(prev => ({ ...prev, hoTen: '' })); }}
          />
          {errorsAddress.hoTen && (
            <div style={{ color: 'red', marginTop: 4 }}>
              {errorsAddress.hoTen}
            </div>
          )}
          <Input
            placeholder="Số điện thoại "
            value={addressForm.soDienThoai}
            onChange={e => { setAddressForm({ ...addressForm, soDienThoai: e.target.value }); setErrorsAddress(prev => ({ ...prev, soDienThoai: '' })); }}
          />
          {errorsAddress.soDienThoai && (
            <div style={{ color: 'red', marginTop: 4 }}>
              {errorsAddress.soDienThoai}
            </div>
          )}

          <Select
            placeholder="Chọn Tỉnh/Thành phố"
            style={{ width: '100%' }}
            value={addressForm.idTinhThanh}
            onChange={handleProvinceChange}
            showSearch
          >
            {provinces.map(p => (
              <Option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</Option>
            ))}
          </Select>
          {errorsAddress.idTinhThanh && (
            <div style={{ color: 'red', marginTop: 4 }}>
              {errorsAddress.idTinhThanh}
            </div>
          )}

          <Select
            placeholder="Chọn Quận/Huyện"
            style={{ width: '100%' }}
            value={addressForm.idQuanHuyen}
            onChange={handleDistrictChange}
            disabled={!addressForm.idTinhThanh}
            showSearch
          >
            {districts.map(d => (
              <Option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</Option>
            ))}
          </Select>
          {errorsAddress.idQuanHuyen && (
            <div style={{ color: 'red', marginTop: 4 }}>
              {errorsAddress.idQuanHuyen}
            </div>
          )}
          <Select
            placeholder="Chọn Phường/Xã"
            style={{ width: '100%' }}
            value={addressForm.idPhuongXa}
            onChange={handleWardChange}
            disabled={!addressForm.idQuanHuyen}
            showSearch
          >
            {wards.map(w => (
              <Option key={w.WardCode} value={w.WardCode}>{w.WardName}</Option>
            ))}
          </Select>
          {errorsAddress.idPhuongXa && (
            <div style={{ color: 'red', marginTop: 4 }}>
              {errorsAddress.idPhuongXa}
            </div>
          )}
          <Input.TextArea
            placeholder="Địa chỉ cụ thể (số nhà, tên đường...)"
            value={addressForm.diaChiChiTiet}
            onChange={e => { setAddressForm({ ...addressForm, diaChiChiTiet: e.target.value }); setErrorsAddress(prev => ({ ...prev, diaChiChiTiet: '' })); }}
            rows={3}
          />
          {errorsAddress.diaChiChiTiet && (
            <div style={{ color: 'red', marginTop: 4 }}>
              {errorsAddress.diaChiChiTiet}
            </div>
          )}
        </div>
      </Modal>
    </div >
  );
};

export default ProfilePage;
