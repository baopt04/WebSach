import { useState, useEffect } from 'react';
import { Card, Space, Button, Image, Tag, message, Popconfirm, Tooltip, Modal, Descriptions, Divider, Row, Col, Typography, QRCode } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/admin/DataTable';
import SearchBar from '../../components/admin/SearchBar';
import PageHeader from '../../components/admin/PageHeader';
import { getAllSach, deleteSach, getSachById } from '../../services/SachService';
import './AdminPage.css';

const { Title, Text } = Typography;

const ProductsPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const resData = await getAllSach();
      const products = Array.isArray(resData) ? resData : (resData?.data || []);

      const sortedData = products.sort((a, b) => {
        if (!a.ngayCapNhat && !b.ngayCapNhat) return 0;
        if (!a.ngayCapNhat) return 1;
        if (!b.ngayCapNhat) return -1;
        return new Date(b.ngayCapNhat) - new Date(a.ngayCapNhat);
      });

      setData(sortedData);
    } catch (error) {
      console.error('Lỗi tải danh sách sản phẩm:', error);
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    setViewLoading(true);
    try {
      const fullDetail = await getSachById(id);
      setDetailItem(fullDetail);
      setDetailOpen(true);
    } catch (error) {
      message.error('Không thể tải chi tiết sản phẩm');
    } finally {
      setViewLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setTimeout(() => setDetailItem(null), 300);
  };

  const filtered = data.filter((p) =>
    (p.tenSach && p.tenSach.toLowerCase().includes(search.toLowerCase())) ||
    (p.maSach && p.maSach.toLowerCase().includes(search.toLowerCase())) ||
    (p.maVach && p.maVach.toLowerCase().includes(search.toLowerCase()))
  );

  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDelete = async (id) => {
    try {
      await deleteSach(id);
      message.success('Xóa sản phẩm thành công');
      fetchProducts();
    } catch (error) {
      console.error('Lỗi xóa sản phẩm:', error);
      message.error('Lỗi: ' + (error.message || 'Không thể xóa sản phẩm'));
    }
  };

  const columns = [
    {
      title: 'Mã vạch',
      dataIndex: 'maVach',
      key: 'maVach',
      width: 120,
    },
    {
      title: 'Ảnh',
      dataIndex: 'duongDanAnh',
      key: 'duongDanAnh',
      width: 80,
      render: (url) => (
        <Image
          src={url}
          alt="product"
          width={40}
          height={50}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="https://via.placeholder.com/40x50?text=No+Img"
          preview={false}
        />
      ),
    },
    {
      title: 'Tên sách',
      dataIndex: 'tenSach',
      key: 'tenSach',
      render: (v) => <strong style={{ color: '#000' }}>{v}</strong>
    },
    {
      title: 'Thể loại',
      dataIndex: 'tenTheLoai',
      key: 'tenTheLoai',
    },
    {
      title: 'Nhà xuất bản',
      dataIndex: 'tenNxb',
      key: 'tenNxb',
    },
    {
      title: 'Giá bán',
      dataIndex: 'giaBan',
      key: 'giaBan',
      render: (val) => `${Number(val).toLocaleString('vi-VN')}₫`
    },
    {
      title: 'Số lượng',
      dataIndex: 'soLuong',
      key: 'soLuong',
      align: 'center',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (status) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? 'Kinh doanh' : 'Ngừng kinh doanh'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<EyeOutlined />}
              loading={viewLoading && detailItem?.id === r.id}
              onClick={() => handleViewDetail(r.id)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/products/edit/${r.id}`)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa sản phẩm này?"
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
        title="Quản lý Sản phẩm"
        onAdd={() => navigate('/admin/products/new')}
        addText="Thêm sản phẩm"
      />
      <Card bordered={false} className="admin-card">
        <div className="admin-toolbar">
          <SearchBar
            placeholder="Tìm theo tên sách, mã vạch..."
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

      <Modal
        title={<Title level={4} style={{ color: '#000', margin: 0 }}>Chi tiết sản phẩm</Title>}
        open={detailOpen}
        onCancel={closeDetail}
        footer={[
          <Button key="close" type="primary" onClick={closeDetail}>Đóng</Button>
        ]}
        width={850}
        style={{ top: 20 }}
        destroyOnClose={true}
      >
        {detailItem && (
          <div className="detail-container">
            <Row gutter={[24, 24]}>
              <Col span={15}>
                <Descriptions
                  bordered
                  column={1}
                  size="small"
                  labelStyle={{ color: '#000', fontWeight: 600, width: 140, background: '#fafafa' }}
                  contentStyle={{ color: '#000' }}
                >
                  <Descriptions.Item label="Tên sách">
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#000' }}>{detailItem.tenSach}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã sách">{detailItem.maSach}</Descriptions.Item>
                  <Descriptions.Item label="Mã vạch">{detailItem.maVach}</Descriptions.Item>
                  <Descriptions.Item label="Giá bán">
                    <span style={{ fontWeight: 700, color: '#000' }}>
                      {Number(detailItem.giaBan).toLocaleString('vi-VN')}₫
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số lượng tồn">
                    <Text style={{ color: '#000' }}>{detailItem.soLuong}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tác giả">{detailItem.tenTacGia}</Descriptions.Item>
                  <Descriptions.Item label="Thể loại">{detailItem.tenTheLoai}</Descriptions.Item>
                  <Descriptions.Item label="Nhà xuất bản">{detailItem.tenNxb}</Descriptions.Item>
                  <Descriptions.Item label="Ngôn ngữ">{detailItem.ngonNgu}</Descriptions.Item>
                  <Descriptions.Item label="Số trang">{detailItem.soTrang}</Descriptions.Item>
                  <Descriptions.Item label="Năm XB">{detailItem.namXuatBan}</Descriptions.Item>
                  <Descriptions.Item label="Kích thước">{detailItem.kichThuoc}</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    {detailItem.trangThai ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
                  </Descriptions.Item>
                </Descriptions>
              </Col>

              <Col span={9}>
                <div style={{ textAlign: 'center' }}>
                  <Image.PreviewGroup>
                    <div style={{ marginBottom: 12 }}>
                      <Image
                        width="100%"
                        style={{ maxHeight: 350, objectFit: 'contain', borderRadius: 8, border: '1px solid #f0f0f0' }}
                        src={detailItem.hinhAnhs && detailItem.hinhAnhs.length > 0 ? detailItem.hinhAnhs[0] : detailItem.duongDanAnh}
                        fallback="https://via.placeholder.com/260x350?text=No+Image"
                      />
                    </div>

                    {detailItem.hinhAnhs && detailItem.hinhAnhs.length > 1 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {detailItem.hinhAnhs.slice(1).map((img, idx) => (
                          <div key={idx} style={{ width: 50, height: 70, overflow: 'hidden', borderRadius: 4, border: '1px solid #eee' }}>
                            <Image
                              width="100%"
                              height="100%"
                              style={{ objectFit: 'cover' }}
                              src={img}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </Image.PreviewGroup>

                  {detailItem.maVach && (
                    <div style={{ marginTop: 24, padding: 12, background: '#fff', border: '1px solid #eee', borderRadius: 8, display: 'inline-block' }}>
                      <QRCode value={detailItem.maVach} size={130} bordered={false} color="#000" />
                      <div style={{ marginTop: 8, fontSize: 13, color: '#000', fontWeight: 600 }}>{detailItem.maVach}</div>
                    </div>
                  )}
                </div>
              </Col>

              <Col span={24}>
                <Divider orientation="left" style={{ margin: '8px 0', borderColor: '#000' }}>
                  <Text style={{ color: '#000', fontWeight: 600 }}>Mô tả sản phẩm</Text>
                </Divider>
                <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: 8, minHeight: 80, color: '#000', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {detailItem.moTa || 'Không có mô tả cho sản phẩm này.'}
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductsPage;