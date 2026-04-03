import { useState, useEffect } from 'react';
import { Card, Modal, Form, Input, Space, Button, Tooltip, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import DataTable from '../../components/admin/DataTable';
import SearchBar from '../../components/admin/SearchBar';
import PageHeader from '../../components/admin/PageHeader';
import {
  getAllTacGia,
  createTacGia,
  updateTacGia,
  deleteTacGia
} from '../../services/TacGiaService';
import './AdminPage.css';

const { TextArea } = Input;

const AuthorsPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [form] = Form.useForm();
  const pageSize = 10;

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const resData = await getAllTacGia();
      const authors = Array.isArray(resData) ? resData : (resData?.data || []);

      const sortedData = authors.sort((a, b) => {
        if (!a.ngayCapNhat && !b.ngayCapNhat) return 0;
        if (!a.ngayCapNhat) return 1;
        if (!b.ngayCapNhat) return -1;
        return new Date(b.ngayCapNhat) - new Date(a.ngayCapNhat);
      });

      setData(sortedData);
    } catch (error) {
      console.error('Lỗi tải danh sách tác giả:', error);
      message.error('Không thể tải danh sách tác giả');
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((a) =>
    a.tenTacGia.toLowerCase().includes(search.toLowerCase()) ||
    (a.tieuSu && a.tieuSu.toLowerCase().includes(search.toLowerCase()))
  );

  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setEditingItem(r);
    form.setFieldsValue(r);
    setModalOpen(true);
  };

  const openDetail = (r) => {
    setDetailItem(r);
    setDetailOpen(true);
  };

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await updateTacGia(editingItem.id, values);
        message.success('Cập nhật tác giả thành công');
      } else {
        await createTacGia(values);
        message.success('Thêm tác giả thành công');
      }
      setModalOpen(false);
      fetchAuthors();
    } catch (error) {
      console.error('Lỗi lưu tác giả:', error);
      message.error('Lỗi: ' + (error.message || 'Không thể lưu thông tin'));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTacGia(id);
      message.success('Xóa tác giả thành công');
      fetchAuthors();
    } catch (error) {
      console.error('Lỗi xóa tác giả:', error);
      message.error('Lỗi: ' + (error.message || 'Không thể xóa tác giả'));
    }
  };

  const columns = [
    {
      title: 'Tên tác giả',
      dataIndex: 'tenTacGia',
      key: 'tenTacGia',
      render: (v) => <strong>{v}</strong>
    },
    {
      title: 'Tiểu sử',
      dataIndex: 'tieuSu',
      key: 'tieuSu',
      ellipsis: true,
      render: (text) => text || 'Chưa có tiểu sử'
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(r)} />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          </Tooltip>
          {/* <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa tác giả này?"
              onConfirm={() => handleDelete(r.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip> */}
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <PageHeader
        title="Quản lý Tác giả"
        onAdd={openAdd}
        addText="Thêm tác giả"
      />
      <Card bordered={false} className="admin-card">
        <div className="admin-toolbar">
          <SearchBar
            placeholder="Tìm theo tên tác giả hoặc tiểu sử..."
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
          loading={loading}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </Card>

      {/* Modal Thêm / Sửa */}
      <Modal
        title={editingItem ? 'Chỉnh sửa tác giả' : 'Thêm tác giả mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingItem ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="tenTacGia"
            label="Tên tác giả"
            rules={[
              { required: true, message: 'Vui lòng nhập tên tác giả' },
              { min: 3, message: 'Tên tác giả phải có ít nhất 3 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tên tác giả" />
          </Form.Item>
          <Form.Item
            name="tieuSu"
            label="Tiểu sử"
            rules={[{ required: true, message: 'Vui lòng nhập tiểu sử' }]}
          >
            <TextArea rows={4} placeholder="Mô tả tiểu sử về tác giả..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Chi Tiết */}
      <Modal
        title="Chi tiết tác giả"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>Đóng</Button>
        ]}
        width={560}
      >
        {detailItem && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <strong>Tên tác giả:</strong>
              <p style={{ margin: '4px 0 0 0', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                {detailItem.tenTacGia}
              </p>
            </div>
            <div>
              <strong>Tiểu sử:</strong>
              <p style={{ margin: '4px 0 0 0', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                {detailItem.tieuSu || 'Chưa có tiểu sử'}
              </p>
            </div>
            <div>
              <strong>Ngày cập nhật cuối:</strong>
              <p style={{ margin: '4px 0 0 0', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                {new Date(detailItem.ngayCapNhat).toLocaleString('vi-VN')}
              </p>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default AuthorsPage;
