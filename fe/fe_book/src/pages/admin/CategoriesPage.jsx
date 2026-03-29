import { useState } from 'react';
import { Card, Modal, Form, Input, Space, Button, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import DataTable from '../../components/admin/DataTable';
import SearchBar from '../../components/admin/SearchBar';
import PageHeader from '../../components/admin/PageHeader';
import './AdminPage.css';

const { TextArea } = Input;

const mockCategories = [
  { id: 1, name: 'Tâm lý - Kỹ năng sống', description: 'Sách phát triển bản thân và kỹ năng mềm', bookCount: 245 },
  { id: 2, name: 'Tiểu thuyết', description: 'Tác phẩm văn học hư cấu', bookCount: 312 },
  { id: 3, name: 'Lịch sử - Địa lý', description: 'Kiến thức lịch sử và địa lý thế giới', bookCount: 187 },
  { id: 4, name: 'Khoa học - Công nghệ', description: 'Sách khoa học và công nghệ', bookCount: 143 },
  { id: 5, name: 'Kinh tế - Kinh doanh', description: 'Quản trị, tài chính và khởi nghiệp', bookCount: 198 },
  { id: 6, name: 'Thiếu nhi', description: 'Sách dành cho trẻ em', bookCount: 276 },
  { id: 7, name: 'Triết học - Tư tưởng', description: 'Sách triết học và tư tưởng học', bookCount: 89 },
  { id: 8, name: 'Văn học nước ngoài', description: 'Tác phẩm văn học dịch từ nước ngoài', bookCount: 421 },
  { id: 9, name: 'Truyện tranh - Comic', description: 'Manga, comic và truyện tranh', bookCount: 534 },
  { id: 10, name: 'Giáo khoa - Tham khảo', description: 'Sách giáo khoa và sách học', bookCount: 367 },
  { id: 11, name: 'Ngoại ngữ', description: 'Học tiếng Anh, Nhật, Hàn...', bookCount: 212 },
  { id: 12, name: 'Tâm linh - Tôn giáo', description: 'Sách về tâm linh và tín ngưỡng', bookCount: 95 },
];

const CategoriesPage = () => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const pageSize = 10;

  const filtered = mockCategories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openAdd = () => { setEditingItem(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r) => { setEditingItem(r); form.setFieldsValue(r); setModalOpen(true); };

  const columns = [
    { title: 'Tên thể loại', dataIndex: 'name', key: 'name', render: (v) => <strong>{v}</strong> },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Số sách',
      dataIndex: 'bookCount',
      key: 'bookCount',
      align: 'center',
      render: (v) => <span style={{ color: '#1677ff', fontWeight: 600 }}>{v}</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, r) => (
        <Space>
          <Tooltip title="Sửa"><Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
          <Tooltip title="Xóa"><Button size="small" danger icon={<DeleteOutlined />} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <PageHeader title="Quản lý Thể loại" onAdd={openAdd} addLabel="Thêm thể loại" />
      <Card bordered={false} className="admin-card">
        <div className="admin-toolbar">
          <SearchBar
            placeholder="Tìm theo tên thể loại..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            onSearch={(v) => { setSearch(v); setCurrentPage(1); }}
          />
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
        title={editingItem ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingItem ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={() => setModalOpen(false)}>
          <Form.Item name="name" label="Tên thể loại" rules={[{ required: true }]}>
            <Input placeholder="Nhập tên thể loại" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả về thể loại..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
