import { useState, useEffect } from 'react';
import { Card, Modal, Form, Input, Select, DatePicker, Switch, Space, Button, Tooltip, Avatar, message, Descriptions, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import DataTable from '../../components/admin/DataTable';
import SearchBar from '../../components/admin/SearchBar';
import PageHeader from '../../components/admin/PageHeader';
import StatusTag from '../../components/admin/StatusTag';
import './AdminPage.css';
import { formatDate } from '../../utils/format';
import { getAllTaiKhoan, createTaiKhoan, updateTaiKhoan, searchTaiKhoan, getTaiKhoanById } from '../../services/AccountService';
import { getDiaChiByTaiKhoanId, createDiaChi, updateDiaChi, deleteDiaChi, setDefaultDiaChi } from '../../services/AddressService';
import { getProvinces, getDistricts, getWards } from '../../services/GhnApi';

const { Option } = Select;
const { confirm } = Modal;

const AccountsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);

  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm] = Form.useForm();

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const [form] = Form.useForm();
  const pageSize = 10;

  const fetchData = async () => {

    try {
      setLoading(true);
      const res = await getAllTaiKhoan();
      if (provinces.length === 0) {
        getProvinces().then(res => {
          console.log("GHN Provinces Response:", res);
          const dataArr = res?.data?.data || res?.data || res;
          if (Array.isArray(dataArr)) {
            setProvinces(dataArr);
          } else {
            message.error("Định dạng dữ liệu Tỉnh/Thành không hợp lệ");
          }
        }).catch((err) => {
          console.error("Lỗi lấy Tỉnh/Thành:", err);
          message.error("Lỗi gọi API Tỉnh/Thành");
        });
      }
      setData(res);
    } catch (err) {
      message.error(err.message || 'Lỗi tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    if (!value) {
      fetchData();
      return;
    }
    try {
      setLoading(true);
      const res = await searchTaiKhoan(value);
      setData(res);
      setCurrentPage(1);
    } catch (err) {
      message.error(err.message || 'Lỗi tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = search ? data : data;
  const filteredByRole = filtered.filter(a => {
    if (!roleFilter) return true;
    return a.vaiTro === roleFilter;
  });

  const paged = filteredByRole.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setEditingItem(r);
    form.setFieldsValue({
      email: r.email,
      hoTen: r.hoTen,
      soDienThoai: r.soDienThoai,
      vaiTro: r.vaiTro,
      ngaySinh: r.ngaySinh ? dayjs(r.ngaySinh) : null,
      gioiTinh: r.gioiTinh === true ? 1 : 0,
      trangThai: r.trangThai === 'ACTIVATED'
    });
    setModalOpen(true);
  };

  const openDetail = async (id) => {
    try {
      setLoading(true);
      const res = await getTaiKhoanById(id);
      setDetailItem(res);
      setDetailModalOpen(true);
    } catch (err) {
      message.error(err.message || 'Lỗi lấy chi tiết tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddressList = async (accountId) => {
    try {
      setAddressLoading(true);
      const res = await getDiaChiByTaiKhoanId(accountId);
      console.log("Check res ", res);

      setAddressList(res);
    } catch (err) {
      if (err.message && err.message.includes('404')) {
        setAddressList([]);
      } else {
        message.error(err.message || 'Lỗi tải danh sách địa chỉ');
      }
    } finally {
      setAddressLoading(false);
    }
  };

  const handleViewAddress = (id) => {
    setSelectedAccountId(id);
    setAddressModalOpen(true);
    fetchAddressList(id);
  };

  const submitAddressForm = async (values) => {
    try {
      const provinceObj = provinces.find(p => p.ProvinceID === values.tinhThanh);
      const districtObj = districts.find(d => d.DistrictID === values.quanHuyen);
      const wardObj = wards.find(w => w.WardCode === values.phuongXa);

      const payload = {
        hoTen: values.hoTen,
        soDienThoai: values.soDienThoai,
        idTaiKhoan: selectedAccountId,
        idTinhThanh: Number(values.tinhThanh) || 0,
        tinhThanh: provinceObj ? provinceObj.ProvinceName : values.tinhThanh,
        idQuanHuyen: Number(values.quanHuyen) || 0,
        quanHuyen: districtObj ? districtObj.DistrictName : values.quanHuyen,
        idPhuongXa: String(values.phuongXa) || "",
        phuongXa: wardObj ? wardObj.WardName : values.phuongXa,
        diaChiChiTiet: values.diaChiChiTiet
      };

      if (editingAddress) {
        try {
          confirm({
            title: "Cập nhật địa chỉ",
            content: "Bạn có chắc muốn cập nhật địa chỉ",
            okText: "Đồng ý",
            cancelText: "Hủy",
            onOk: async () => {
              await updateDiaChi(editingAddress.id, payload);
              message.success("Cập nhật địa chỉ thành công")
              fetchAddressList(selectedAccountId);
            }
          })
        } catch (error) {
          message.error(error.message || "Lỗi cập nhật địa chỉ")
        }
      } else {
        try {
          confirm({
            title: "Thêm địa chỉ",
            content: "Bạn có chắc muốn thêm địa chỉ",
            okText: "Đồng ý",
            cancelText: "Hủy",
            onOk: async () => {
              await createDiaChi(payload);
              message.success("Thêm địa chỉ mới thành công")
              fetchAddressList(selectedAccountId);
            }
          })
        } catch (error) {
          message.error(error.message || "Lỗi thêm địa chỉ")
        }
      }
      setAddressFormOpen(false);
      fetchAddressList(selectedAccountId);
    } catch (error) {
      message.error(error.message || 'Lỗi lưu địa chỉ');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    confirm({
      title: 'Thiết lập địa chỉ mặc định?',
      content: 'Bạn có chắc chắn muốn đặt địa chỉ này làm địa chỉ nhận hàng mặc định?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await setDefaultDiaChi(id);
          message.success('Đã đặt làm mặc định');
          fetchAddressList(selectedAccountId);
        } catch (err) {
          message.error(err.message || 'Lỗi đặt mặc định');
        }
      }
    });
  };

  const handleDeleteAddress = (id) => {
    confirm({
      title: 'Xóa địa chỉ?',
      content: 'Bạn có chắc chắn muốn xóa địa chỉ này?',
      okText: 'Đồng ý',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteDiaChi(id);
          message.success('Xóa địa chỉ thành công');
          fetchAddressList(selectedAccountId);
        } catch (err) {
          message.error(err.message || 'Lỗi khi xóa');
        }
      }
    });
  };

  const openAddAddress = async () => {
    setEditingAddress(null);
    addressForm.resetFields();
    setDistricts([]);
    setWards([]);
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setAddressFormOpen(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddress(addr);
    const loadAndPreselect = async () => {
      let pList = provinces;
      if (pList.length === 0) {
        const pRes = await getProvinces();
        pList = pRes?.data?.data || pRes?.data || pRes || [];
        if (Array.isArray(pList)) setProvinces(pList);
      }
      if (addr.idTinhThanh) {
        const dRes = await getDistricts(addr.idTinhThanh);
        const dList = dRes?.data?.data || dRes?.data || dRes || [];
        if (Array.isArray(dList)) setDistricts(dList);
        setSelectedProvince(addr.idTinhThanh);
        if (addr.idQuanHuyen) {
          const wRes = await getWards(addr.idQuanHuyen);
          const wList = wRes?.data?.data || wRes?.data || wRes || [];
          if (Array.isArray(wList)) setWards(wList);
          setSelectedDistrict(addr.idQuanHuyen);
        }
      }
    };
    loadAndPreselect().catch((e) => { console.error("Error pre-loading address", e) });
    addressForm.setFieldsValue({
      hoTen: addr.hoTen,
      soDienThoai: addr.soDienThoai,
      tinhThanh: addr.idTinhThanh,
      quanHuyen: addr.idQuanHuyen,
      phuongXa: addr.idPhuongXa,
      diaChiChiTiet: addr.diaChiChiTiet
    });
    setAddressFormOpen(true);
  };

  const handleProvinceChange = async (provinceId) => {
    setSelectedProvince(provinceId);
    setDistricts([]);
    setWards([]);
    addressForm.setFieldsValue({ quanHuyen: undefined, phuongXa: undefined });
    try {
      const res = await getDistricts(provinceId);
      const dList = res?.data?.data || res?.data || res || [];
      if (Array.isArray(dList)) setDistricts(dList);
    } catch (e) { console.error("Error districts:", e) }
  };

  const handleDistrictChange = async (districtId) => {
    setSelectedDistrict(districtId);
    setWards([]);
    addressForm.setFieldsValue({ phuongXa: undefined });
    try {
      const res = await getWards(districtId);
      const wList = res?.data?.data || res?.data || res || [];
      if (Array.isArray(wList)) setWards(wList);
    } catch (e) { console.error("Error wards:", e) }
  };

  const handleSubmit = (values) => {
    confirm({
      title: editingItem ? 'Xác nhận cập nhật tài khoản?' : 'Xác nhận tạo tài khoản mới?',
      content: editingItem 
        ? `Bạn có chắc chắn muốn cập nhật thông tin cho tài khoản ${editingItem.hoTen}?`
        : 'Hệ thống sẽ tạo tài khoản mới với các thông tin bạn đã cung cấp. Tiếp tục?',
      okText: 'Xác nhận',
      cancelText: 'Quay lại',
      onOk: async () => {
        try {
          const payload = {
            email: values.email,
            hoTen: values.hoTen,
            soDienThoai: values.soDienThoai,
            vaiTro: values.vaiTro,
            ngaySinh: values.ngaySinh ? values.ngaySinh.format('DD-MM-YYYY') : null,
            gioiTinh: values.gioiTinh,
            trangThai: values.trangThai ? 'ACTIVATED' : 'BLOCKED'
          };

          if (!editingItem) {
            payload.trangThai = 'ACTIVATED';
          }

          if (editingItem) {
            await updateTaiKhoan(editingItem.id, payload);
            message.success('Cập nhật tài khoản thành công');
          } else {
            await createTaiKhoan(payload);
            message.success('Tạo tài khoản thành công');
          }

          setModalOpen(false);
          fetchData();
        } catch (error) {
          message.error(error.message || 'Lỗi lưu dữ liệu');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Mã TK',
      dataIndex: 'maTaiKhoan',
      key: 'maTaiKhoan',
      render: (v) => v ? <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{v}</code> : <span style={{ color: '#999' }}>N/A</span>,
    },
    {
      title: 'Họ tên',
      dataIndex: 'hoTen',
      key: 'hoTen',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size={28} icon={<UserOutlined />} style={{ background: '#4096ff' }} />
          <span style={{ fontWeight: 500 }}>{v}</span>
        </div>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Số điện thoại', dataIndex: "soDienThoai", key: 'soDienThoai'
    },
    {
      title: 'Vai trò',
      dataIndex: 'vaiTro',
      key: 'vaiTro',
      render: (r) => {
        let color = 'cyan';
        let label = 'Khách hàng';
        if (r === 'ROLE_ADMIN') { color = 'gold'; label = 'Admin'; }
        else if (r === 'ROLE_STAFF') { color = 'blue'; label = 'Nhân viên'; }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (s) => <StatusTag status={s === 'ACTIVATED' ? 'ACTIVATED' : 'BLOCKED'} />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(r.id)} />
          </Tooltip>
          <Tooltip title="Sổ địa chỉ">
            <Button size="small" icon={<EnvironmentOutlined />} onClick={() => handleViewAddress(r.id)} />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <PageHeader title="Quản lý Tài khoản" onAdd={openAdd} addLabel="Thêm tài khoản" />
      <Card bordered={false} className="admin-card">
        <div className="admin-toolbar">
          <SearchBar
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={handleSearch}
          />
          <Select defaultValue="" style={{ width: 160 }} onChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
            <Option value="">Tất cả vai trò</Option>
            <Option value="ROLE_ADMIN">Admin</Option>
            <Option value="ROLE_STAFF">Nhân viên</Option>
            <Option value="ROLE_CUSTOMER">Khách hàng</Option>
          </Select>
        </div>
        <DataTable
          loading={loading}
          columns={columns}
          dataSource={paged}
          total={filteredByRole.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
          rowKey="id"
        />
      </Card>

      <Modal
        title={editingItem ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingItem ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} validateTrigger="onChange">
          <Form.Item 
            name="hoTen" 
            label="Họ tên" 
            rules={[
              { required: true, message: 'Vui lòng nhập họ tên' },
              { whitespace: true, message: 'Họ tên không được chỉ chứa khoảng trắng' },
              { min: 3, message: 'Họ tên phải có ít nhất 3 ký tự' },
              { max: 100, message: 'Họ tên tối đa 100 ký tự' },
              { pattern: /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s|_]+$/, message: 'Họ tên chỉ được chứa chữ cái' }
            ]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>
          <Form.Item 
            name="email" 
            label="Email" 
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Định dạng email không hợp lệ' },
              { whitespace: true, message: 'Email không được chứa khoảng trắng' }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
          <Form.Item 
            name="soDienThoai" 
            label="Số điện thoại" 
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^(0[3|5|7|8|9])+([0-9]{8})\b$/, message: 'Số điện thoại 10 số, bắt đầu bằng 03, 05, 07, 08, 09' }
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item name="vaiTro" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
            <Select placeholder="Chọn vai trò">
              <Option value="ROLE_ADMIN">ADMIN</Option>
              <Option value="ROLE_CUSTOMER">Khách hàng</Option>
            </Select>
          </Form.Item>
          <Form.Item 
            name="ngaySinh" 
            label="Ngày sinh"
            rules={[
              { required: true, message: 'Vui lòng chọn ngày sinh' },
              () => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  const age = dayjs().diff(dayjs(value), 'year');
                  if (age < 18) {
                    return Promise.reject(new Error('Tài khoản phải đủ 18 tuổi trở lên'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="Chọn ngày sinh" />
          </Form.Item>
          <Form.Item name="gioiTinh" label="Giới tính" initialValue={1} rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}>
            <Select>
              <Option value={1}>Nam</Option>
              <Option value={0}>Nữ</Option>
            </Select>
          </Form.Item>

          {editingItem && (
            <Form.Item name="trangThai" label="Trạng thái hoạt động" valuePropName="checked">
              <Switch checkedChildren="ACTIVATED" unCheckedChildren="INACTIVE" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title="Chi tiết tài khoản"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>Đóng</Button>
        ]}
        width={600}
      >
        {detailItem && (
          <Descriptions bordered column={1} size="small" labelStyle={{ width: 140, fontWeight: 600 }}>
            <Descriptions.Item label="Mã tài khoản">{detailItem.maTaiKhoan || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Họ tên">
              <strong style={{ color: '#1677ff' }}>{detailItem.hoTen}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Email">{detailItem.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{detailItem.soDienThoai}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {detailItem.gioiTinh === true ? 'Nam' : detailItem.gioiTinh === false ? 'Nữ' : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {detailItem.ngaySinh}
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Tag color={detailItem.vaiTro === 'ROLE_ADMIN' ? 'gold' : detailItem.vaiTro === 'ROLE_CUSTOMER' ? 'cyan' : 'blue'}>
                {detailItem.vaiTro === 'ROLE_ADMIN' ? 'Admin' : detailItem.vaiTro === 'ROLE_CUSTOMER' ? 'Khách hàng' : 'Nhân viên'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <StatusTag status={detailItem.trangThai === 'ACTIVATED' ? 'active' : 'inactive'} />
            </Descriptions.Item>
            {detailItem.ngayTao && (
              <Descriptions.Item label="Ngày tạo">{formatDate(detailItem.ngayTao)}</Descriptions.Item>
            )}
            {detailItem.ngayCapNhat && (
              <Descriptions.Item label="Cập nhật lần cuối">{formatDate(detailItem.ngayCapNhat)}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      <Modal
        title={null}
        open={addressModalOpen}
        onCancel={() => setAddressModalOpen(false)}
        footer={null}
        width={800}
        styles={{ body: { padding: '24px 24px 8px 24px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Danh sách địa chỉ</h2>
          <Button type="primary" onClick={openAddAddress}>+ Thêm địa chỉ mới</Button>
        </div>

        <div className="address-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
          {[...addressList].sort((a, b) => (a.macDinh === b.macDinh ? 0 : a.macDinh ? -1 : 1)).map(item => (
            <div key={item.id} style={{
              border: item.macDinh ? '1px solid #91caff' : '1px solid #f0f0f0',
              backgroundColor: item.macDinh ? '#f0f5ff' : '#ffffff',
              borderRadius: '8px',
              padding: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '15px' }}>
                  <strong style={{ color: '#000000e0' }}>{item.hoTen}</strong>
                  <span style={{ margin: '0 8px', color: '#bfbfbf' }}>|</span>
                  <span style={{ color: '#000000a6' }}>{item.soDienThoai}</span>
                </div>
                <Space size="middle">
                  <span style={{ cursor: 'pointer', background: '#1677ff', color: "white", padding: '7px', borderRadius: '5px' }} onClick={() => openEditAddress(item)}><EditOutlined /></span>
                  {!item.macDinh && (
                    <span style={{ cursor: 'pointer', background: '#ff4d4f', color: "white", padding: '7px', borderRadius: '5px' }} onClick={() => handleDeleteAddress(item.id)}><DeleteOutlined /></span>
                  )}
                </Space>
              </div>
              <div style={{ color: '#000000a6', marginBottom: '16px', fontSize: '14px' }}>
                {item.diaChiChiTiet}, {item.phuongXa}, {item.quanHuyen}, {item.tinhThanh}
              </div>
              <div style={{ display: 'flex', justifyContent: item.macDinh ? 'flex-start' : 'flex-end' }}>
                {item.macDinh ? (
                  <Tag bordered={false} color="processing" style={{ borderRadius: 4, margin: 0 }}>Mặc định</Tag>
                ) : (
                  <Button style={{ borderRadius: 4 }} onClick={() => handleSetDefaultAddress(item.id)}>Thiết lập mặc định</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        title={editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
        open={addressFormOpen}
        onCancel={() => setAddressFormOpen(false)}
        onOk={() => addressForm.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={addressForm} layout="vertical" onFinish={submitAddressForm} validateTrigger="onChange">
          <Form.Item
            name="hoTen"
            label="Họ và tên người nhận"
            rules={[
              { required: true, message: 'Vui lòng nhập Họ Tên người nhận' },
              { whitespace: true, message: 'Họ tên không được chỉ chứa khoảng trắng' },
              { min: 3, message: 'Họ Tên phải có ít nhất 3 ký tự' },
              { pattern: /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s|_]+$/, message: 'Họ tên chỉ được chứa chữ cái' }
            ]}
          >
            <Input placeholder="Nhập họ tên người nhận" />
          </Form.Item>
          <Form.Item name="soDienThoai" label="Số điện thoại" rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            { pattern: /^(0[3|5|7|8|9])+([0-9]{8})\b$/, message: 'SĐT không hợp lệ (10 số, bắt đầu 03,05,07,08,09)' }
          ]}>
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item name="tinhThanh" label="Tỉnh/Thành phố" rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành' }]}>
            <Select
              showSearch
              placeholder="Chọn tỉnh/thành phố"
              optionFilterProp="children"
              onChange={handleProvinceChange}
              filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {provinces.map(p => (
                <Option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="quanHuyen" label="Quận/Huyện" rules={[{ required: true, message: 'Vui lòng chọn Quận/Huyện' }]}>
            <Select
              showSearch
              placeholder={selectedProvince ? 'Chọn quận/huyện' : 'Vui lòng chọn Tỉnh/Thành trước'}
              optionFilterProp="children"
              disabled={!selectedProvince}
              onChange={handleDistrictChange}
              filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {districts.map(d => (
                <Option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="phuongXa" label="Phường/Xã" rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã' }]}>
            <Select
              showSearch
              placeholder={selectedDistrict ? 'Chọn phường/xã' : 'Vui lòng chọn Quận/Huyện trước'}
              optionFilterProp="children"
              disabled={!selectedDistrict}
              filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {wards.map(w => (
                <Option key={w.WardCode} value={w.WardCode}>{w.WardName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            name="diaChiChiTiet" 
            label="Địa chỉ chi tiết" 
            rules={[
              { required: true, message: 'Vui lòng nhập Địa chỉ cụ thể' },
              { min: 5, message: 'Địa chỉ cụ thể quá ngắn (tối thiểu 5 ký tự)' }
            ]}
          >
            <Input.TextArea placeholder="Số nhà, ngõ/đường..." rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountsPage;
