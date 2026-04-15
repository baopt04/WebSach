import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Select, Space, Button, Tooltip, Typography, Tabs, DatePicker, message, Badge } from 'antd';
import { EyeOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAllHoaDon, searchHoaDon, searchHoaDonByDate } from '../../services/hoaDonService';
import DataTable from '../../components/admin/DataTable';
import SearchBar from '../../components/admin/SearchBar';
import PageHeader from '../../components/admin/PageHeader';
import StatusTag from '../../components/admin/StatusTag';
import './AdminPage.css';

const { Option } = Select;
const { Text } = Typography;
const { RangePicker } = DatePicker;
const HIDDEN_ORDER_STATUS = 'TAO_HOA_DON';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailOrder, setDetailOrder] = useState(null);
  const pageSize = 10;

  const normalizeOrders = (list) => {
    const source = Array.isArray(list) ? list : [];
    return source.filter((item) => item?.trangThai !== HIDDEN_ORDER_STATUS);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllHoaDon();
      setOrders(normalizeOrders(data));
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSearchKeyword = async (value) => {
    setSearch(value);
    setCurrentPage(1);
    setDateFilter(null);
    if (!value || !value.trim()) {
      loadOrders();
      return;
    }
    setLoading(true);
    try {
      const data = await searchHoaDon(value);
      setOrders(normalizeOrders(data));
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tìm kiếm hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchDate = async (dates) => {
    setDateFilter(dates);
    setCurrentPage(1);
    setSearch('');
    if (!dates || dates.length === 0) {
      loadOrders();
      return;
    }
    const tuNgay = dates[0].format('YYYY-MM-DD');
    const denNgay = dates[1].format('YYYY-MM-DD');
    setLoading(true);
    try {
      const data = await searchHoaDonByDate(tuNgay, denNgay);
      setOrders(normalizeOrders(data));
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tìm kiếm hóa đơn theo ngày");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setDateFilter(null);
    setStatusFilter('');
    setCurrentPage(1);
    loadOrders();
  };

  const filtered = orders.filter((o) => {
    const matchStatus = !statusFilter || o.trangThai === statusFilter;
    return matchStatus;
  });

  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'maHoaDon',
      key: 'maHoaDon',
      render: (v) => <Text strong style={{ color: '#1677ff' }}>{v}</Text>,
    },
    { title: 'Khách hàng', dataIndex: 'hoTenKhachHang', key: 'hoTenKhachHang' },
    { title: 'SĐT', dataIndex: 'soDienThoai', key: 'soDienThoai' },
    {
      title: 'Ngày đặt',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      render: (v) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : ''
    },
    {
      title: 'Tổng thanh toán',
      key: 'tongThanhToan',
      render: (_, record) => {
        const tongTien = record.tongTienHang || 0;
        const phiShip = record.phiShip || 0;
        const giamGia = record.giamGia || 0;
        const tong = tongTien + phiShip - giamGia;

        const final = tong < 0 ? 0 : tong;

        return (
          <strong style={{ color: '#1677ff' }}>
            {final.toLocaleString('vi-VN')}₫
          </strong>
        );
      },
    },
    {
      title: 'Loại hóa đơn',
      dataIndex: "loaiHoaDon",
      key: 'loaiHoaDon'
    },
    {
      title: 'Phương thức TT',
      dataIndex: 'phuongThuc',
      key: 'phuongThuc',
      render: (v) => {
        if (v === 'CHUYEN_KHOAN') return 'Chuyển khoản';
        if (v === 'VNPAY') return 'VNPAY';
        if (v === 'TIEN_MAT') return 'Tiền mặt';
        return v;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (s) => <StatusTag status={s} />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      render: (_, r) => (
        <Space>
          <Tooltip title="Chi tiết">
            <Button size="small" type="primary" ghost icon={<EyeOutlined />} onClick={() => navigate(`/admin/orders/${r.id}`)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderTab = (title, statusKey) => {
    const count = statusKey === '' ? orders.length : orders.filter(o => o.trangThai === statusKey).length;
    const badgeColor = statusKey === 'DA_HUY' ? '#ff4d4f' : (statusKey === 'THANH_CONG' || statusKey === 'DA_GIAO' ? '#1677ff' : '#1677ff');
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {title}
        <Badge count={count} showZero overflowCount={9999} color={badgeColor} style={{ marginTop: '-2px' }} />
      </span>
    );
  };

  return (
    <div className="admin-page">
      <PageHeader title="Quản lý Hóa đơn" showAdd={false} />


      <Card bordered={false} className="admin-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16 }}>
          <SearchBar
            placeholder="Tìm theo mã đơn, sđt, tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={handleSearchKeyword}
          />
          <Select
            value={statusFilter}
            style={{ width: 180 }}
            onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
          >
            <Option value="">Tất cả trạng thái</Option>
            <Option value="CHO_XAC_NHAN">Chờ xác nhận</Option>
            <Option value="DA_XAC_NHAN">Đã xác nhận</Option>
            <Option value="DANG_CHUAN_BI_HANG">Đang chuẩn bị</Option>
            <Option value="DANG_GIAO">Đang giao</Option>
            <Option value="DA_THANH_TOAN">Đã thanh toán</Option>
            <Option value="THANH_CONG">Thành công</Option>
            <Option value="DA_HUY">Đã hủy</Option>
          </Select>
          <RangePicker
            format="DD/MM/YYYY"
            value={dateFilter}
            onChange={handleSearchDate}
            style={{ width: 250 }}
            placeholder={['Từ ngày', 'Đến ngày']}
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
          <Tooltip title="Làm mới">
            <Button icon={<ReloadOutlined />} onClick={handleReset} />
          </Tooltip>
        </div>
      </Card>


      <Card bordered={false} className="admin-card">
        <Tabs
          activeKey={statusFilter}
          onChange={(key) => { setStatusFilter(key); setCurrentPage(1); }}
          items={[
            { key: '', label: renderTab('Tất cả', '') },
            { key: 'CHO_XAC_NHAN', label: renderTab('Chờ xác nhận', 'CHO_XAC_NHAN') },
            { key: 'DA_XAC_NHAN', label: renderTab('Đã xác nhận', 'DA_XAC_NHAN') },
            { key: 'DANG_CHUAN_BI_HANG', label: renderTab('Đang chuẩn bị', 'DANG_CHUAN_BI_HANG') },
            { key: 'DANG_GIAO', label: renderTab('Đang giao', 'DANG_GIAO') },
            { key: 'DA_THANH_TOAN', label: renderTab('Đã thanh toán', 'DA_THANH_TOAN') },
            { key: 'THANH_CONG', label: renderTab('Thành công', 'THANH_CONG') },
            { key: 'DA_HUY', label: renderTab('Đã hủy', 'DA_HUY') },
          ]}
        />

        <DataTable
          columns={columns}
          dataSource={paged}
          total={filtered.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
          loading={loading}
          rowKey="id"
        />
      </Card>

    </div>
  );
};

export default OrdersPage;
