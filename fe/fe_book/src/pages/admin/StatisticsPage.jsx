import { useState } from 'react';
import { Card, Row, Col, Select, DatePicker, Table, Typography, Tag } from 'antd';
import { BarChartOutlined, RiseOutlined, TrophyOutlined } from '@ant-design/icons';
import PageHeader from '../../components/admin/PageHeader';
import './AdminPage.css';
import './StatisticsPage.css';

const { Option } = Select;
const { Text, Title } = Typography;

// Dữ liệu doanh thu theo tháng, quý
const monthlyData = [
  { month: 'T1', revenue: 32000000, orders: 145, customers: 130 },
  { month: 'T2', revenue: 28000000, orders: 120, customers: 112 },
  { month: 'T3', revenue: 41000000, orders: 185, customers: 168 },
  { month: 'T4', revenue: 38000000, orders: 170, customers: 155 },
  { month: 'T5', revenue: 45000000, orders: 210, customers: 195 },
  { month: 'T6', revenue: 52000000, orders: 238, customers: 221 },
  { month: 'T7', revenue: 48000000, orders: 215, customers: 198 },
  { month: 'T8', revenue: 61000000, orders: 278, customers: 256 },
  { month: 'T9', revenue: 55000000, orders: 248, customers: 230 },
  { month: 'T10', revenue: 67000000, orders: 305, customers: 280 },
  { month: 'T11', revenue: 72000000, orders: 325, customers: 300 },
  { month: 'T12', revenue: 48500000, orders: 218, customers: 202 },
];

const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

// Top sản phẩm
const topProducts = Array.from({ length: 10 }, (_, i) => ({
  key: i + 1,
  rank: i + 1,
  title: ['Đắc Nhân Tâm', 'Nhà Giả Kim', 'Sapiens', 'Tư Duy Nhanh Chậm', 'Muôn Kiếp Nhân Sinh', 'Dám Nghĩ Lớn', 'Người Giàu Có Nhất Thành Babylon', 'Tôi Thấy Hoa Vàng...', 'Mắt Biếc', 'Cà Phê Cùng Tony'][i],
  category: ['Tâm lý', 'Tiểu thuyết', 'Lịch sử', 'Tâm lý', 'Tâm linh', 'Kỹ năng', 'Tài chính', 'Văn học VN', 'Văn học VN', 'Văn học VN'][i],
  sold: [215, 198, 167, 143, 128, 115, 98, 87, 76, 65][i],
  revenue: [32250000, 29700000, 43420000, 37180000, 22400000, 17250000, 14700000, 9570000, 8360000, 9750000][i],
}));

const topColumns = [
  { title: '#', dataIndex: 'rank', key: 'rank', width: 50, align: 'center',
    render: (v) => (
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: v <= 3 ? ['#ffd700','#c0c0c0','#cd7f32'][v-1] : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto', fontWeight: 700, color: v <= 3 ? '#fff' : '#595959', fontSize: 13 }}>{v}</div>
    ),
  },
  { title: 'Tên sách', dataIndex: 'title', key: 'title', render: (v) => <Text strong>{v}</Text> },
  { title: 'Thể loại', dataIndex: 'category', key: 'category' },
  { title: 'Đã bán', dataIndex: 'sold', key: 'sold', align: 'center', render: (v) => <Tag color="blue">{v}</Tag> },
  { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', render: (v) => <Text strong style={{ color: '#52c41a' }}>{v.toLocaleString('vi-VN')}₫</Text> },
];

// Thống kê theo thể loại
const categoryStats = [
  { name: 'Tâm lý - Kỹ năng', percent: 28, color: '#4096ff' },
  { name: 'Tiểu thuyết', percent: 22, color: '#52c41a' },
  { name: 'Văn học nước ngoài', percent: 18, color: '#fa8c16' },
  { name: 'Thiếu nhi', percent: 12, color: '#722ed1' },
  { name: 'Lịch sử', percent: 10, color: '#eb2f96' },
  { name: 'Khác', percent: 10, color: '#bfbfbf' },
];

const StatisticsPage = () => {
  const [period, setPeriod] = useState('month');

  const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = monthlyData.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div className="admin-page">
      <PageHeader
        title="Báo cáo Thống kê"
        showAdd={false}
        extra={
          <Select value={period} onChange={setPeriod} style={{ width: 140 }}>
            <Option value="month">Theo tháng</Option>
            <Option value="quarter">Theo quý</Option>
            <Option value="year">Theo năm</Option>
          </Select>
        }
      />

      {/* KPI tổng hợp */}
      <Row gutter={[16, 16]}>
        {[
          { label: 'Tổng doanh thu năm', value: `${(totalRevenue / 1000000).toFixed(0)}tr ₫`, color: '#4096ff', icon: <RiseOutlined /> },
          { label: 'Tổng đơn hàng', value: totalOrders, color: '#52c41a', icon: <BarChartOutlined /> },
          { label: 'Doanh thu TB / tháng', value: `${(totalRevenue / 12 / 1000000).toFixed(1)}tr ₫`, color: '#fa8c16', icon: <RiseOutlined /> },
          { label: 'Đơn hàng TB / tháng', value: Math.round(totalOrders / 12), color: '#722ed1', icon: <TrophyOutlined /> },
        ].map((item, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false} className="admin-card stat-kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24, color: item.color }}>{item.icon}</span>
                <div>
                  <div style={{ color: '#8c8c8c', fontSize: 13 }}>{item.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Biểu đồ */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={<><BarChartOutlined /> Doanh thu theo tháng (2026)</>} bordered={false} className="admin-card">
            <div className="stat-bar-chart">
              {monthlyData.map((d) => (
                <div key={d.month} className="stat-bar-item">
                  <div className="stat-bar-value">{(d.revenue / 1000000).toFixed(0)}tr</div>
                  <div className="stat-bar" style={{ height: `${(d.revenue / maxRevenue) * 180}px` }} />
                  <div className="stat-bar-orders">{d.orders} đơn</div>
                  <div className="stat-bar-label">{d.month}</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={<><TrophyOutlined /> Doanh thu theo thể loại</>} bordered={false} className="admin-card" style={{ height: '100%' }}>
            <div className="stat-category-list">
              {categoryStats.map((c, i) => (
                <div key={i} className="stat-category-item">
                  <div className="stat-category-top">
                    <span style={{ color: c.color, fontWeight: 600 }}>{c.name}</span>
                    <span style={{ color: c.color, fontWeight: 700 }}>{c.percent}%</span>
                  </div>
                  <div className="stat-category-bar">
                    <div className="stat-category-fill" style={{ width: `${c.percent}%`, background: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Top sản phẩm */}
      <Card title={<><TrophyOutlined /> Top 10 sách bán chạy</>} bordered={false} className="admin-card">
        <Table columns={topColumns} dataSource={topProducts} pagination={false} size="small" />
      </Card>
    </div>
  );
};

export default StatisticsPage;
