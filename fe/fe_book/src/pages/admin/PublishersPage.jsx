import { useState, useEffect } from 'react';
import { Card, Modal, Form, Input, Space, Button, Tooltip, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, ShopOutlined } from '@ant-design/icons';
import DataTable from '../../components/admin/DataTable';
import SearchBar from '../../components/admin/SearchBar';
import PageHeader from '../../components/admin/PageHeader';
import { 
  getAllNhaXuatBan, 
  createNhaXuatBan, 
  updateNhaXuatBan, 
  deleteNhaXuatBan 
} from '../../services/NhaXuatBanService';
import './AdminPage.css';

const PublishersPage = () => {
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
    fetchPublishers();
  }, []);

  const fetchPublishers = async () => {
    setLoading(true);
    try {
      const resData = await getAllNhaXuatBan();
      const publishers = Array.isArray(resData) ? resData : (resData?.data || []);
      
      // Sắp xếp: ngayCapNhat mới nhất lên trên, null xuống dưới cùng
      const sortedData = publishers.sort((a, b) => {
        if (!a.ngayCapNhat && !b.ngayCapNhat) return 0;
        if (!a.ngayCapNhat) return 1;
        if (!b.ngayCapNhat) return -1;
        return new Date(b.ngayCapNhat) - new Date(a.ngayCapNhat);
      });

      setData(sortedData);
    } catch (error) {
      console.error('Lỗi tải danh sách nhà xuất bản:', error);
      message.error('Không thể tải danh sách nhà xuất bản');
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((p) =>
    (p.tenNxb && p.tenNxb.toLowerCase().includes(search.toLowerCase())) ||
    (p.diaChi && p.diaChi.toLowerCase().includes(search.toLowerCase())) ||
    (p.soDienThoai && p.soDienThoai.toLowerCase().includes(search.toLowerCase()))
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
        await updateNhaXuatBan(editingItem.id, values);
        message.success('Cập nhật nhà xuất bản thành công');
      } else {
        await createNhaXuatBan(values);
        message.success('Thêm nhà xuất bản thành công');
      }
      setModalOpen(false);
      fetchPublishers();
    } catch (error) {
      console.error('Lỗi lưu nhà xuất bản:', error);
      message.error('Lỗi: ' + (error.message || 'Không thể lưu thông tin'));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNhaXuatBan(id);
      message.success('Xóa nhà xuất bản thành công');
      fetchPublishers();
    } catch (error) {
      console.error('Lỗi xóa nhà xuất bản:', error);
      message.error('Lỗi: ' + (error.message || 'Không thể xóa nhà xuất bản'));
    }
  };

  const columns = [
    { 
      title: 'Tên nhà xuất bản', 
      dataIndex: 'tenNxb', 
      key: 'tenNxb', 
      render: (v) => <strong>{v}</strong> 
    },
    { 
      title: 'Địa chỉ', 
      dataIndex: 'diaChi', 
      key: 'diaChi', 
      ellipsis: true 
    },
    { 
      title: 'Số điện thoại', 
      dataIndex: 'soDienThoai', 
      key: 'soDienThoai' 
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
          <Tooltip title="Xóa">
            <Popconfirm 
              title="Bạn có chắc chắn muốn xóa nhà xuất bản này?" 
              onConfirm={() => handleDelete(r.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <PageHeader 
        title="Quản lý Nhà xuất bản" 
        onAdd={openAdd} 
        addText="Thêm nhà xuất bản"
      />
      <Card bordered={false} className="admin-card">
        <div className="admin-toolbar">
          <SearchBar
            placeholder="Tìm theo tên nxb, địa chỉ, sđt..."
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
        title={editingItem ? 'Chỉnh sửa nhà xuất bản' : 'Thêm nhà xuất bản mới'}
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
            name="tenNxb" 
            label="Tên nhà xuất bản" 
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà xuất bản' }]}
          >
            <Input placeholder="Nhập tên nxb" />
          </Form.Item>
          <Form.Item 
            name="diaChi" 
            label="Địa chỉ" 
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
          <Form.Item 
            name="soDienThoai" 
            label="Số điện thoại" 
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9+() \-]+$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Chi Tiết */}
      <Modal
        title="Chi tiết nhà xuất bản"
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
              <strong>Tên nhà xuất bản:</strong>
              <p style={{ margin: '4px 0 0 0', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                {detailItem.tenNxb}
              </p>
            </div>
            <div>
              <strong>Địa chỉ:</strong>
              <p style={{ margin: '4px 0 0 0', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                {detailItem.diaChi || 'Chưa có thông tin'}
              </p>
            </div>
            <div>
              <strong>Số điện thoại:</strong>
              <p style={{ margin: '4px 0 0 0', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                {detailItem.soDienThoai || 'Chưa có thông tin'}
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

export default PublishersPage;
