import { Row, Col, Card, Statistic, Typography, Table, Tag } from 'antd';
import {
  ShoppingOutlined,
  FileTextOutlined,
  UserOutlined,
  DollarOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import './DashboardPage.css';

const { Title, Text } = Typography;


const kpiData = [
  {
    title: 'Doanh thu tháng',
    value: 48500000,
    prefix: '',
    suffix: '₫',
    icon: <DollarOutlined />,
    color: '#4096ff',
    bg: '#e6f4ff',
    trend: '+12.5%',
    up: true,
  },
  {
    title: 'Đơn hàng',
    value: 238,
    icon: <FileTextOutlined />,
    color: '#52c41a',
    bg: '#f6ffed',
    trend: '+8.3%',
    up: true,
  },
  {
    title: 'Sản phẩm',
    value: 1450,
    icon: <ShoppingOutlined />,
    color: '#fa8c16',
    bg: '#fff7e6',
    trend: '+3.2%',
    up: true,
  },
  {
    title: 'Tài khoản',
    value: 3892,
    icon: <UserOutlined />,
    color: '#722ed1',
    bg: '#f9f0ff',
    trend: '-1.2%',
    up: false,
  },
];


const revenueData = [
  { month: 'T1', value: 32000000 },
  { month: 'T2', value: 28000000 },
  { month: 'T3', value: 41000000 },
  { month: 'T4', value: 38000000 },
  { month: 'T5', value: 45000000 },
  { month: 'T6', value: 52000000 },
  { month: 'T7', value: 48000000 },
  { month: 'T8', value: 61000000 },
  { month: 'T9', value: 55000000 },
  { month: 'T10', value: 67000000 },
  { month: 'T11', value: 72000000 },
  { month: 'T12', value: 48500000 },
];
const maxRevenue = Math.max(...revenueData.map((d) => d.value));


const recentOrders = [
  { key: 1, code: 'DH001', customer: 'Nguyễn Văn A', date: '27/03/2026', total: 250000, status: 'delivered' },
  { key: 2, code: 'DH002', customer: 'Trần Thị B', date: '27/03/2026', total: 185000, status: 'processing' },
  { key: 3, code: 'DH003', customer: 'Lê Minh C', date: '26/03/2026', total: 420000, status: 'shipped' },
  { key: 4, code: 'DH004', customer: 'Phạm Hồng D', date: '26/03/2026', total: 95000, status: 'pending' },
  { key: 5, code: 'DH005', customer: 'Hoàng Văn E', date: '25/03/2026', total: 310000, status: 'cancelled' },
];

const statusConfig = {
  pending: { color: 'warning', label: 'Chờ xác nhận' },
  processing: { color: 'processing', label: 'Đang xử lý' },
  shipped: { color: 'purple', label: 'Đang giao' },
  delivered: { color: 'success', label: 'Đã giao' },
  cancelled: { color: 'error', label: 'Đã hủy' },
};

const orderColumns = [
  { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, i) => i + 1 },
  { title: 'Mã đơn', dataIndex: 'code', key: 'code', render: (t) => <Text strong>{t}</Text> },
  { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
  { title: 'Ngày đặt', dataIndex: 'date', key: 'date' },
  {
    title: 'Tổng tiền',
    dataIndex: 'total',
    key: 'total',
    render: (v) => <Text strong style={{ color: '#1677ff' }}>{v.toLocaleString('vi-VN')}₫</Text>,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (s) => {
      const c = statusConfig[s] || { color: 'default', label: s };
      return <Tag color={c.color}>{c.label}</Tag>;
    },
  },
];

// Top sách bán chạy
const topBooks = [
  { key: 1, title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', sold: 215, revenue: 32250000 },
  { key: 2, title: 'Nhà Giả Kim', author: 'Paulo Coelho', sold: 198, revenue: 29700000 },
  { key: 3, title: 'Sapiens', author: 'Yuval Noah Harari', sold: 167, revenue: 43420000 },
  { key: 4, title: 'Tư Duy Nhanh Chậm', author: 'Daniel Kahneman', sold: 143, revenue: 37180000 },
  { key: 5, title: 'Muôn Kiếp Nhân Sinh', author: 'Brian Weiss', sold: 128, revenue: 22400000 },
];

const topBookColumns = [
  { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, i) => i + 1 },
  { title: 'Tên sách', dataIndex: 'title', key: 'title', render: (t) => <Text strong>{t}</Text> },
  { title: 'Tác giả', dataIndex: 'author', key: 'author' },
  { title: 'Đã bán', dataIndex: 'sold', key: 'sold', align: 'center', render: (v) => <Tag color="blue">{v}</Tag> },
  {
    title: 'Doanh thu',
    dataIndex: 'revenue',
    key: 'revenue',
    render: (v) => <Text strong style={{ color: '#52c41a' }}>{v.toLocaleString('vi-VN')}₫</Text>,
  },
];

const DashboardPage = () => {
  return (
    <div className="dashboard-page">

      <Row gutter={[16, 16]} className="kpi-row">
        {kpiData.map((kpi, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card className="kpi-card" bordered={false}>
              <div className="kpi-card-inner">
                <div className="kpi-icon-wrap" style={{ background: kpi.bg }}>
                  <span className="kpi-icon" style={{ color: kpi.color }}>
                    {kpi.icon}
                  </span>
                </div>
                <div className="kpi-info">
                  <Text className="kpi-label">{kpi.title}</Text>
                  <div className="kpi-value">
                    {kpi.value.toLocaleString('vi-VN')}
                    {kpi.suffix && <span className="kpi-suffix">{kpi.suffix}</span>}
                  </div>
                  <div className={`kpi-trend ${kpi.up ? 'up' : 'down'}`}>
                    {kpi.up ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    <span>{kpi.trend} so với tháng trước</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>


      <Row gutter={[16, 16]} className="chart-row">
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="chart-title">
                <RiseOutlined style={{ color: '#1677ff' }} />
                <span>Doanh thu theo tháng (2026)</span>
              </div>
            }
            bordered={false}
            className="chart-card"
          >
            <div className="bar-chart">
              {revenueData.map((d) => (
                <div key={d.month} className="bar-item">
                  <div className="bar-value">{(d.value / 1000000).toFixed(0)}tr</div>
                  <div
                    className="bar"
                    style={{ height: `${(d.value / maxRevenue) * 160}px` }}
                  />
                  <div className="bar-label">{d.month}</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>


        <Col xs={24} lg={8}>
          <Card title="Tóm tắt hôm nay" bordered={false} className="chart-card">
            <div className="summary-list">
              {[
                { label: 'Đơn hàng mới', value: 24, color: '#4096ff' },
                { label: 'Đơn chờ xử lý', value: 8, color: '#fa8c16' },
                { label: 'Đã giao thành công', value: 15, color: '#52c41a' },
                { label: 'Đơn bị hủy', value: 1, color: '#ff4d4f' },
                { label: 'Khách hàng mới', value: 12, color: '#722ed1' },
                { label: 'Doanh thu hôm nay', value: '4.2tr₫', color: '#1677ff', isText: true },
              ].map((item, i) => (
                <div key={i} className="summary-item">
                  <span className="summary-dot" style={{ background: item.color }} />
                  <Text className="summary-label">{item.label}</Text>
                  <Text strong style={{ color: item.color }}>
                    {item.isText ? item.value : item.value}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>


      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Đơn hàng gần đây" bordered={false} className="table-card">
            <Table
              columns={orderColumns}
              dataSource={recentOrders}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Top sách bán chạy" bordered={false} className="table-card">
            <Table
              columns={topBookColumns}
              dataSource={topBooks}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
