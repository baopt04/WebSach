import { useState, useEffect, useCallback } from 'react';
import { Card, Modal, Form, Input, InputNumber, Select, Switch, Space, Button, Image, Tooltip, message } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import DataTable from '../../components/admin/DataTable';
import SearchBar from '../../components/admin/SearchBar';
import PageHeader from '../../components/admin/PageHeader';
import StatusTag from '../../components/admin/StatusTag';
import SachService from '../../services/SachService';
import './AdminPage.css';

const { Option } = Select;
const { TextArea } = Input;

const ProductsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchTimer, setSearchTimer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const pageSize = 10;

  // ── fetch tất cả sách ──────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SachService.getAll();
      setData(res.data);
    } catch {
      message.error('Không thể tải danh sách sách!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── tìm kiếm debounce 400ms ────────────────────────────────────────────────
  const handleSearch = (val) => {
    setSearch(val);
    setCurrentPage(1);
    if (searchTimer) clearTimeout(searchTimer);
    if (!val.trim()) {
      fetchAll();
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await SachService.search(val.trim());
        setData(res.data);
      } catch {
        message.error('Tìm kiếm thất bại!');
      } finally {
        setLoading(false);
      }
    }, 400);
    setSearchTimer(t);
  };

  // ── phân trang client-side ─────────────────────────────────────────────────
  const paged = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ── mở modal thêm ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  // ── mở modal sửa — gọi API lấy chi tiết ──────────────────────────────────
  const openEdit = async (record) => {
    try {
      const res = await SachService.detail(record.id);
      const d = res.data;
      setEditingItem(d);
      form.setFieldsValue({
        maSach: d.maSach,
        maVach: d.maVach,
        tenSach: d.tenSach,
        giaBan: d.giaBan,
        soLuong: d.soLuong,
        soTrang: d.soTrang,
        ngonNgu: d.ngonNgu,
        namXuatBan: d.namXuatBan,
        kichThuoc: d.kichThuoc,
        moTa: d.moTa,
        idTheLoai: d.idTheLoai,
        idNxb: d.idNxb,
        duongDanAnh: d.duongDanAnh,
        trangThai: d.trangThai !== false,
      });
      setModalOpen(true);
    } catch {
      message.error('Không thể tải dữ liệu sách!');
    }
  };

  // ── lưu (thêm / cập nhật) ─────────────────────────────────────────────────
  const handleFinish = async (values) => {
    const payload = {
      ...values,
      giaBan: Number(values.giaBan),
      soLuong: Number(values.soLuong),
      soTrang: values.soTrang ? Number(values.soTrang) : null,
      namXuatBan: values.namXuatBan ? Number(values.namXuatBan) : null,
      idTheLoai: Number(values.idTheLoai),
      idNxb: Number(values.idNxb),
    };
    try {
      if (editingItem) {
        await SachService.update(editingItem.id, payload);
        message.success('Cập nhật sách thành công!');
      } else {
        await SachService.add(payload);
        message.success('Thêm sách thành công!');
      }
      setModalOpen(false);
      fetchAll();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Có lỗi xảy ra!';
      message.error(msg);
    }
  };

  // ── ẩn sách ───────────────────────────────────────────────────────────────
  const handleHidden = async (record) => {
    Modal.confirm({
      title: `Ẩn sách "${record.tenSach}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await SachService.hidden(record.id);
          message.success('Đã ẩn sách thành công!');
          fetchAll();
        } catch {
          message.error('Ẩn sách thất bại!');
        }
      },
    });
  };

  // ── columns ────────────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'duongDanAnh',
      key: 'duongDanAnh',
      width: 70,
      render: (src) =>
          src ? (
              <Image src={src} width={44} height={58} style={{ objectFit: 'cover', borderRadius: 4 }} />
          ) : (
              <div style={{ width: 44, height: 58, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📖</div>
          ),
    },
    {
      title: 'Mã sách',
      dataIndex: 'maSach',
      key: 'maSach',
      render: (v) => <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>{v}</span>,
    },
    { title: 'Tên sách', dataIndex: 'tenSach', key: 'tenSach', render: (v) => <strong>{v}</strong> },
    { title: 'Thể loại', dataIndex: 'tenTheLoai', key: 'tenTheLoai' },
    { title: 'NXB', dataIndex: 'tenNxb', key: 'tenNxb' },
    {
      title: 'Giá bán',
      dataIndex: 'giaBan',
      key: 'giaBan',
      render: (v) => <strong style={{ color: '#1677ff' }}>{Number(v).toLocaleString('vi-VN')}₫</strong>,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'soLuong',
      key: 'soLuong',
      align: 'center',
      render: (v) => <span style={{ color: v < 20 ? '#ff4d4f' : '#595959' }}>{v}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (s) => <StatusTag status={s ? 'active' : 'inactive'} />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      render: (_, record) => (
          <Space>
            <Tooltip title="Xem">
              <Button size="small" icon={<EyeOutlined />} onClick={() => openEdit(record)} />
            </Tooltip>
            <Tooltip title="Sửa">
              <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openEdit(record)} />
            </Tooltip>
            <Tooltip title="Ẩn">
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleHidden(record)} />
            </Tooltip>
          </Space>
      ),
    },
  ];

  // ── render ─────────────────────────────────────────────────────────────────
  return (
      <div className="admin-page">
        <PageHeader title="Quản lý Sản phẩm" onAdd={openAdd} />
        <Card bordered={false} className="admin-card">
          <div className="admin-toolbar">
            <SearchBar
                placeholder="Tìm theo tên sách, mã sách..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                onSearch={(v) => handleSearch(v)}
            />
            <Space>
              <Select defaultValue="" style={{ width: 150 }} onChange={() => {}}>
                <Option value="">Tất cả thể loại</Option>
              </Select>
              <Select defaultValue="" style={{ width: 140 }} onChange={() => {}}>
                <Option value="">Tất cả trạng thái</Option>
                <Option value="active">Hiển thị</Option>
                <Option value="inactive">Đã ẩn</Option>
              </Select>
            </Space>
          </div>
          <DataTable
              columns={columns}
              dataSource={paged}
              loading={loading}
              total={data.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={(p) => setCurrentPage(p)}
          />
        </Card>

        {/* Modal thêm / sửa */}
        <Modal
            title={editingItem ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
            open={modalOpen}
            onCancel={() => setModalOpen(false)}
            onOk={() => form.submit()}
            okText={editingItem ? 'Cập nhật' : 'Thêm'}
            cancelText="Hủy"
            width={700}
        >
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            <Form.Item name="maSach" label="Mã sách" rules={[{ required: true, message: 'Mã sách không được để trống' }]}>
              <Input placeholder="VD: SACH001" />
            </Form.Item>
            <Form.Item name="maVach" label="Mã vạch">
              <Input placeholder="Mã vạch" />
            </Form.Item>
            <Form.Item name="tenSach" label="Tên sách" rules={[{ required: true, message: 'Tên sách không được để trống' }]}>
              <Input placeholder="Nhập tên sách" />
            </Form.Item>
            <Form.Item name="giaBan" label="Giá bán (₫)" rules={[{ required: true, message: 'Giá bán không được để trống' }]}>
              <InputNumber
                  style={{ width: '100%' }} min={0} placeholder="VD: 85000"
                  formatter={(v) => v && `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(v) => v.replace(/,/g, '')}
              />
            </Form.Item>
            <Form.Item name="soLuong" label="Số lượng" rules={[{ required: true, message: 'Số lượng không được để trống' }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="idTheLoai" label="ID Thể loại" rules={[{ required: true, message: 'Phải nhập ID thể loại' }]}>
              <InputNumber style={{ width: '100%' }} min={1} placeholder="ID thể loại từ BE" />
            </Form.Item>
            <Form.Item name="idNxb" label="ID Nhà xuất bản" rules={[{ required: true, message: 'Phải nhập ID nhà xuất bản' }]}>
              <InputNumber style={{ width: '100%' }} min={1} placeholder="ID NXB từ BE" />
            </Form.Item>
            <Form.Item name="soTrang" label="Số trang">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="ngonNgu" label="Ngôn ngữ">
              <Input placeholder="VD: Tiếng Việt" />
            </Form.Item>
            <Form.Item name="namXuatBan" label="Năm xuất bản">
              <InputNumber style={{ width: '100%' }} placeholder="VD: 2023" />
            </Form.Item>
            <Form.Item name="kichThuoc" label="Kích thước">
              <Input placeholder="VD: 14 x 20 cm" />
            </Form.Item>
            <Form.Item name="duongDanAnh" label="Đường dẫn ảnh">
              <Input placeholder="https://..." />
            </Form.Item>
            <Form.Item name="moTa" label="Mô tả">
              <TextArea rows={3} placeholder="Mô tả ngắn về sách" />
            </Form.Item>
            <Form.Item name="trangThai" label="Trạng thái" valuePropName="checked" initialValue={true}>
              <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
  );
};

export default ProductsPage;