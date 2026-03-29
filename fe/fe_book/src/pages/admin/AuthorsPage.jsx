import { useState } from 'react';
import { Card, Modal, Form, Input, Select, Space, Button, Tooltip, Image } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import DataTable from '../../components/admin/DataTable';
import SearchBar from '../../components/admin/SearchBar';
import PageHeader from '../../components/admin/PageHeader';
import './AdminPage.css';

const { TextArea } = Input;
const { Option } = Select;

const mockAuthors = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  image: `https://picsum.photos/seed/author${i + 1}/60/60`,
  name: ['Dale Carnegie', 'Paulo Coelho', 'Yuval Noah Harari', 'Daniel Kahneman', 'Brian Weiss', 'Nguyễn Nhật Ánh'][i % 6],
  nationality: ['Mỹ', 'Brazil', 'Israel', 'Israel', 'Mỹ', 'Việt Nam'][i % 6],
  bookCount: [12, 8, 5, 3, 7, 25][i % 6],
  description: 'Tác giả nổi tiếng với nhiều tác phẩm best-seller trên toàn thế giới.',
}));

const AuthorsPage = () => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const pageSize = 10;

  const filtered = mockAuthors.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.nationality.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openAdd = () => { setEditingItem(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r) => { setEditingItem(r); form.setFieldsValue(r); setModalOpen(true); };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 70,
      render: (src) => <Image src={src} width={48} height={48} style={{ objectFit: 'cover', borderRadius: '50%' }} />,
    },
    { title: 'Tên tác giả', dataIndex: 'name', key: 'name', render: (v) => <strong>{v}</strong> },
    { title: 'Quốc tịch', dataIndex: 'nationality', key: 'nationality' },
    { title: 'Số sách', dataIndex: 'bookCount', key: 'bookCount', align: 'center' },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem"><Button size="small" icon={<EyeOutlined />} /></Tooltip>
          <Tooltip title="Sửa"><Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
          <Tooltip title="Xóa"><Button size="small" danger icon={<DeleteOutlined />} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <PageHeader title="Quản lý Tác giả" onAdd={openAdd} />
      <Card bordered={false} className="admin-card">
        <div className="admin-toolbar">
          <SearchBar
            placeholder="Tìm theo tên tác giả, quốc tịch..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            onSearch={(v) => { setSearch(v); setCurrentPage(1); }}
          />
          <Select defaultValue="" style={{ width: 160 }}>
            <Option value="">Tất cả quốc gia</Option>
            <Option value="vn">Việt Nam</Option>
            <Option value="us">Mỹ</Option>
            <Option value="other">Khác</Option>
          </Select>
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
        title={editingItem ? 'Chỉnh sửa tác giả' : 'Thêm tác giả mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingItem ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={() => setModalOpen(false)}>
          <Form.Item name="name" label="Tên tác giả" rules={[{ required: true }]}>
            <Input placeholder="Nhập tên tác giả" />
          </Form.Item>
          <Form.Item name="nationality" label="Quốc tịch">
            <Input placeholder="Nhập quốc tịch" />
          </Form.Item>
          <Form.Item name="image" label="URL ảnh đại diện">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="description" label="Tiểu sử / Mô tả">
            <TextArea rows={4} placeholder="Mô tả về tác giả..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AuthorsPage;
