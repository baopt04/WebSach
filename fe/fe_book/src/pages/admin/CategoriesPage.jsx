import { useState, useEffect } from 'react';
import { Card, Modal, Form, Input, Space, Button, Tooltip, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import DataTable from '../../components/admin/DataTable';
import SearchBar from '../../components/admin/SearchBar';
import PageHeader from '../../components/admin/PageHeader';
import {
  getAllTheLoai,
  createTheLoai,
  updateTheLoai,
  deleteTheLoai
} from '../../services/TheLoaiService';
import './AdminPage.css';

const CategoriesPage = () => {
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const resData = await getAllTheLoai();
      const categories = Array.isArray(resData) ? resData : (resData?.data || []);

      const sortedData = categories.sort((a, b) => {
        if (!a.ngayCapNhat && !b.ngayCapNhat) return 0;
        if (!a.ngayCapNhat) return 1;
        if (!b.ngayCapNhat) return -1;
        return new Date(b.ngayCapNhat) - new Date(a.ngayCapNhat);
      });

      setData(sortedData);
    } catch (error) {
      console.error('Lỗi tải danh sách thể loại:', error);
      message.error('Không thể tải danh sách thể loại');
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((c) =>
    c.tenTheLoai && c.tenTheLoai.toLowerCase().includes(search.toLowerCase())
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

  const handleSave = (values) => {
    Modal.confirm({
      title: editingItem ? 'Xác nhận cập nhật thể loại?' : 'Xác nhận thêm thể loại mới?',
      content: editingItem 
        ? `Bạn có chắc chắn muốn đổi tên thành "${values.tenTheLoai}"?`
        : `Bạn có chắc chắn muốn thêm thể loại mới "${values.tenTheLoai}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          if (editingItem) {
            await updateTheLoai(editingItem.id, values);
            message.success('Cập nhật thể loại thành công');
          } else {
            await createTheLoai(values);
            message.success('Thêm thể loại thành công');
          }
          setModalOpen(false);
          fetchCategories();
        } catch (error) {
          console.error('Lỗi lưu thể loại:', error);
          message.error('Lỗi: ' + (error.message || 'Không thể lưu thông tin'));
        }
      }
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteTheLoai(id);
      message.success('Xóa thể loại thành công');
      fetchCategories();
    } catch (error) {
      console.error('Lỗi xóa thể loại:', error);
      message.error('Lỗi: ' + (error.message || 'Không thể xóa thể loại'));
    }
  };

  const columns = [
    {
      title: 'Tên thể loại',
      dataIndex: 'tenTheLoai',
      key: 'tenTheLoai',
      render: (v) => <strong>{v}</strong>
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
              title="Bạn có chắc chắn muốn xóa thể loại này?"
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
        title="Quản lý Thể loại"
        onAdd={openAdd}
        addLabel="Thêm thể loại"
      />
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
          loading={loading}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </Card>

      {/* Modal Thêm / Sửa */}
      <Modal
        title={editingItem ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingItem ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          validateTrigger="onChange"
        >
          <Form.Item
            name="tenTheLoai"
            label="Tên thể loại"
            rules={[
              { required: true, message: 'Vui lòng nhập tên thể loại' },
              { whitespace: true, message: 'Tên thể loại không được chỉ chứa khoảng trắng' },
              { min: 2, message: 'Tên thể loại phải có ít nhất 2 ký tự' },
              { max: 50, message: 'Tên thể loại tối đa 50 ký tự' }
            ]}
          >
            <Input placeholder="Ví dụ: Tiểu thuyết, Kỹ năng sống..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Chi Tiết */}
      <Modal
        title="Chi tiết thể loại"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>Đóng</Button>
        ]}
        width={500}
      >
        {detailItem && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <strong>Tên thể loại:</strong>
              <p style={{ margin: '4px 0 0 0', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                {detailItem.tenTheLoai}
              </p>
            </div>
            <div>
              <strong>Ngày cập nhật cuối:</strong>
              <p style={{ margin: '4px 0 0 0', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                {detailItem.ngayCapNhat ? new Date(detailItem.ngayCapNhat).toLocaleString('vi-VN') : 'Chưa có thông tin'}
              </p>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default CategoriesPage;
