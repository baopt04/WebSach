import { useState } from 'react';
import { Card, Modal, Form, Input, InputNumber, Select, Switch, Space, Button, Image, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import DataTable from '../../components/admin/DataTable';
import SearchBar from '../../components/admin/SearchBar';
import PageHeader from '../../components/admin/PageHeader';
import StatusTag from '../../components/admin/StatusTag';
import './AdminPage.css';

const { Option } = Select;
const { TextArea } = Input;

const mockProducts = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  image: `https://picsum.photos/seed/book${i + 1}/60/80`,
  name: ['Đắc Nhân Tâm', 'Nhà Giả Kim', 'Sapiens', 'Tư Duy Nhanh Chậm', 'Muôn Kiếp Nhân Sinh'][i % 5],
  author: ['Dale Carnegie', 'Paulo Coelho', 'Yuval Noah Harari', 'Daniel Kahneman', 'Brian Weiss'][i % 5],
  category: ['Tâm lý', 'Tiểu thuyết', 'Lịch sử', 'Khoa học', 'Tâm linh'][i % 5],
  price: [85000, 95000, 260000, 259000, 175000][i % 5],
  stock: Math.floor(Math.random() * 200) + 10,
  status: i % 7 === 0 ? 'inactive' : 'active',
}));

const ProductsPage = () => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const pageSize = 10;

  const filtered = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase())
  );

  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 70,
      render: (src) => (
        <Image src={src} width={44} height={58} style={{ objectFit: 'cover', borderRadius: 4 }} />
      ),
    },
    { title: 'Tên sách', dataIndex: 'name', key: 'name' },
    { title: 'Tác giả', dataIndex: 'author', key: 'author' },
    { title: 'Thể loại', dataIndex: 'category', key: 'category' },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      render: (v) => <strong style={{ color: '#1677ff' }}>{v.toLocaleString('vi-VN')}₫</strong>,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      align: 'center',
      render: (v) => <span style={{ color: v < 20 ? '#ff4d4f' : '#595959' }}>{v}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <StatusTag status={s} />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem"><Button size="small" icon={<EyeOutlined />} /></Tooltip>
          <Tooltip title="Sửa"><Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openEdit(record)} /></Tooltip>
          <Tooltip title="Xóa"><Button size="small" danger icon={<DeleteOutlined />} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <PageHeader title="Quản lý Sản phẩm" onAdd={openAdd} />
      <Card bordered={false} className="admin-card">
        <div className="admin-toolbar">
          <SearchBar
            placeholder="Tìm theo tên sách, tác giả..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            onSearch={(v) => { setSearch(v); setCurrentPage(1); }}
          />
          <Space>
            <Select defaultValue="" style={{ width: 150 }} onChange={() => {}}>
              <Option value="">Tất cả thể loại</Option>
              <Option value="tam-ly">Tâm lý</Option>
              <Option value="tieu-thuyet">Tiểu thuyết</Option>
              <Option value="lich-su">Lịch sử</Option>
            </Select>
            <Select defaultValue="" style={{ width: 140 }} onChange={() => {}}>
              <Option value="">Tất cả trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Ngừng HĐ</Option>
            </Select>
          </Space>
        </div>
        <DataTable
          columns={columns}
          dataSource={paged}
          total={filtered.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </Card>

      <Modal
        title={editingItem ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingItem ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={() => setModalOpen(false)}>
          <Form.Item name="name" label="Tên sách" rules={[{ required: true }]}>
            <Input placeholder="Nhập tên sách" />
          </Form.Item>
          <Form.Item name="author" label="Tác giả" rules={[{ required: true }]}>
            <Input placeholder="Nhập tên tác giả" />
          </Form.Item>
          <Form.Item name="category" label="Thể loại">
            <Select placeholder="Chọn thể loại">
              <Option value="Tâm lý">Tâm lý</Option>
              <Option value="Tiểu thuyết">Tiểu thuyết</Option>
              <Option value="Lịch sử">Lịch sử</Option>
              <Option value="Khoa học">Khoa học</Option>
            </Select>
          </Form.Item>
          <Form.Item name="price" label="Giá bán (₫)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} placeholder="Ví dụ: 85000" formatter={(v) => v && `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item name="stock" label="Số lượng tồn kho">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả ngắn về sách" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng HĐ" defaultChecked />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
