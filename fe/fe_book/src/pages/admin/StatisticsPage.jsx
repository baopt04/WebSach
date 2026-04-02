import { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Table, Typography, Tag, Spin, Statistic, Button } from 'antd';
import { BarChartOutlined, RiseOutlined, TrophyOutlined, ShoppingCartOutlined, CloseCircleOutlined, CalendarOutlined, FileExcelOutlined } from '@ant-design/icons';
import PageHeader from '../../components/admin/PageHeader';
import * as StatisticalService from '../../services/StatisticalService';
import * as ExcelService from '../../services/ExcelService';
import dayjs from 'dayjs';
import { message } from 'antd';
import './AdminPage.css';
import './StatisticsPage.css';

const { Option } = Select;
const { Text } = Typography;

const formatVND = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0).replace('₫', '₫');
};

const topColumns = [
  {
    title: 'STT', dataIndex: 'idSach', key: 'idSach', width: 50, align: 'center',
    render: (_, __, index) => (
      <div >{index + 1}</div>
    ),
  },
  { title: 'Tên sách', dataIndex: 'tenSach', key: 'tenSach', render: (v) => <Text strong>{v}</Text> },
  { title: 'Thể loại', dataIndex: 'tenTheLoai', key: 'tenTheLoai' },
  { title: 'Đã bán', dataIndex: 'soLuongDaBan', key: 'soLuongDaBan', align: 'center', render: (v) => <Tag color="blue">{v}</Tag> },
  { title: 'Doanh thu', dataIndex: 'doanhThu', key: 'doanhThu', render: (v) => <Text strong style={{ color: '#52c41a' }}>{formatVND(v)}</Text> },
];

const StatisticsPage = () => {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    monthlyOrders: 0,
    cancelledOrders: 0,
    topBooks: [],
    yearlyChartData: []
  });

  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const [
        summary,
        cancelledOrdersCount,
        topBooksList
      ] = await Promise.all([
        StatisticalService.getSummaryStatistics(),
        StatisticalService.getTotalCancelledOrders(),
        StatisticalService.getTop10BestSellingBooks()
      ]);

      // Calculate current month stats from chiTietTheoThang
      const currentMonthData = summary.chiTietTheoThang?.find(
        d => d.thang === currentMonth && d.nam === currentYear
      ) || { tongDoanhThu: 0, tongDonHang: 0 };

      // Sort chart data chronologically
      const sortedChartData = [...(summary.chiTietTheoThang || [])].sort((a, b) => {
        if (a.nam !== b.nam) return a.nam - b.nam;
        return a.thang - b.thang;
      });

      setStats({
        totalOrders: summary.tongDonHang || 0,
        totalRevenue: summary.tongDoanhThu || 0,
        monthlyRevenue: currentMonthData.tongDoanhThu || 0,
        monthlyOrders: currentMonthData.tongDonHang || 0,
        cancelledOrders: cancelledOrdersCount || 0,
        topBooks: topBooksList || [],
        yearlyChartData: sortedChartData
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const success = ExcelService.exportStatisticsToExcel(stats);
    if (success) {
      message.success('Xuất file Excel thành công!');
    } else {
      message.error('Lỗi khi xuất file Excel.');
    }
  };

  const maxRevenue = Math.max(...(stats.yearlyChartData.map(d => d.tongDoanhThu) || [0]), 1);
  const maxOrders = Math.max(...(stats.yearlyChartData.map(d => d.tongDonHang) || [0]), 1);

  if (loading) {
    return (
      <div className="admin-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="Đang tải thống kê..." />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Tổng doanh thu',
      value: formatVND(stats.totalRevenue),
      color: '#4096ff',
      icon: <RiseOutlined />,
    },
    {
      label: 'Tổng đơn hàng',
      value: stats.totalOrders.toLocaleString(),
      color: '#52c41a',
      icon: <ShoppingCartOutlined />,
    },
    {
      label: `Doanh thu tháng ${currentMonth}`,
      value: formatVND(stats.monthlyRevenue),
      color: '#fa8c16',
      icon: <CalendarOutlined />,
    },
    {
      label: `Đơn hàng tháng ${currentMonth}`,
      value: stats.monthlyOrders.toLocaleString(),
      color: '#722ed1',
      icon: <BarChartOutlined />,
    },
    {
      label: 'Đơn hàng bị hủy',
      value: stats.cancelledOrders.toLocaleString(),
      color: '#ff4d4f',
      icon: <CloseCircleOutlined />,
      bg: 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)'
    }
  ];

  return (
    <div className="admin-page">
      <PageHeader
        title=""
        showAdd={false}
        extra={
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              Xuất báo cáo Excel
            </Button>

          </div>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpis.map((item, i) => (
          <Col xs={24} sm={12} lg={4.8} key={i} style={{ flexBasis: i < 5 ? '20%' : 'auto', maxWidth: i < 5 ? '20%' : '100%' }}>
            <Card bordered={false} className="admin-card stat-kpi-card" style={{ background: item.bg, border: 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 24, color: item.color, background: '#ffffffcc', padding: 8, borderRadius: 8, display: 'flex' }}>{item.icon}</span>
                </div>
                <div>
                  <div style={{ color: '#595959', fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#262626', marginTop: 4 }}>{item.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={stats.topBooks.length > 0 ? 16 : 24}>
          <Card
            title={<><BarChartOutlined /> Biến động doanh thu & đơn hàng theo tháng</>}
            bordered={false}
            className="admin-card"
            extra={<Tag color="blue">Dữ liệu tổng hợp</Tag>}
          >
            <div className="stat-bar-chart" style={{ height: 320, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 60, overflowX: 'auto', paddingBottom: 10 }}>
              {stats.yearlyChartData.map((d) => (
                <div key={`${d.nam}-${d.thang}`} className="stat-bar-item" style={{ minWidth: 80, textAlign: 'center', position: 'relative', padding: '0 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, height: 200 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="stat-bar-value" style={{ fontSize: 10, color: '#4096ff', marginBottom: 4, fontWeight: 'bold' }}>
                        {d.tongDoanhThu > 0 ? `${(d.tongDoanhThu / 1000).toFixed(0)}k` : ''}
                      </div>
                      <div
                        className="stat-bar"
                        style={{
                          height: `${(d.tongDoanhThu / maxRevenue) * 180}px`,
                          width: '20px',
                          background: 'linear-gradient(to top, #4096ff, #bae0ff)',
                          borderRadius: '4px 4px 0 0',
                          minHeight: d.tongDoanhThu > 0 ? 2 : 0,
                          transition: 'height 0.3s'
                        }}
                        title={`Doanh thu: ${formatVND(d.tongDoanhThu)}`}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="stat-bar-value" style={{ fontSize: 10, color: '#52c41a', marginBottom: 4, fontWeight: 'bold' }}>
                        {d.tongDonHang > 0 ? d.tongDonHang : ''}
                      </div>
                      <div
                        className="stat-bar"
                        style={{
                          height: `${(d.tongDonHang / maxOrders) * 180}px`,
                          width: '12px',
                          background: 'linear-gradient(to top, #52c41a, #b7eb8f)',
                          borderRadius: '3px 3px 0 0',
                          minHeight: d.tongDonHang > 0 ? 2 : 0,
                          transition: 'height 0.3s'
                        }}
                        title={`Đơn hàng: ${d.tongDonHang}`}
                      />
                    </div>
                  </div>

                  <div className="stat-bar-label" style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: (d.thang === currentMonth && d.nam === currentYear) ? '#4096ff' : '#595959' }}>
                    T{d.thang}/{d.nam}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 24, color: '#8c8c8c', fontSize: 12 }}>
              <span>
                <div style={{ display: 'inline-block', width: 12, height: 12, background: '#4096ff', marginRight: 8, borderRadius: 2 }}></div>
                Doanh thu (Nghìn VNĐ)
              </span>
              <span>
                <div style={{ display: 'inline-block', width: 12, height: 12, background: '#52c41a', marginRight: 8, borderRadius: 2 }}></div>
                Số lượng đơn hàng
              </span>
            </div>
          </Card>
        </Col>

        {stats.topBooks.length > 0 && (
          <Col xs={24} lg={8}>
            <Card title={<><TrophyOutlined /> Hiệu suất bán hàng</>} bordered={false} className="admin-card" style={{ height: '100%' }}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Statistic
                  title="Doanh thu bình quân / Đơn hàng"
                  value={stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0}
                  formatter={(v) => formatVND(v)}
                  valueStyle={{ color: '#fa8c16' }}
                />
                <div style={{ marginTop: 24 }}>
                  <Statistic
                    title="Tỷ lệ hủy đơn"
                    value={stats.totalOrders > 0 ? (stats.cancelledOrders / (stats.totalOrders + stats.cancelledOrders)) * 100 : 0}
                    suffix="%"
                    precision={1}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </div>
              </div>
            </Card>
          </Col>
        )}
      </Row>

      <Card
        title={<><TrophyOutlined /> Top 10 sách bán chạy nhất</>}
        bordered={false}
        className="admin-card"
        style={{ marginTop: 24 }}
        extra={<Tag color="gold">Sản phẩm tiêu biểu</Tag>}
      >
        <Table
          columns={topColumns}
          dataSource={stats.topBooks.map((item, index) => ({ ...item, key: index }))}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default StatisticsPage;
