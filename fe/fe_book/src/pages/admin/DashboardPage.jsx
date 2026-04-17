import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Table, Tag, Spin, Button, message } from 'antd';
import {
  ShoppingOutlined,
  FileTextOutlined,
  UserOutlined,
  DollarOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CloseCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as StatisticalService from '../../services/StatisticalService';
import { getAllHoaDon } from '../../services/hoaDonService';

import { exportDashboardExcel } from '../../services/ExcelService';
import './DashboardPage.css';

const { Title, Text } = Typography;

const MOCK_ACCOUNTS = 3892;

const statusConfig = {
  CHO_XAC_NHAN: { color: 'warning', label: 'Chờ xác nhận' },
  DA_XAC_NHAN: { color: 'processing', label: 'Đã xác nhận' },
  DANG_CHUAN_BI_HANG: { color: 'processing', label: 'Đang chuẩn bị' },
  DANG_GIAO: { color: 'purple', label: 'Đang giao' },
  DA_THANH_TOAN: { color: 'success', label: 'Đã thanh toán' },
  THANH_CONG: { color: 'success', label: 'Thành công' },
  DA_HUY: { color: 'error', label: 'Đã hủy' },
};

const formatMoneyShorthand = (val) => {
  if (!val) return '0₫';
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'tr₫';
  if (val >= 1000) return (val / 1000).toFixed(0) + 'k₫';
  return val + '₫';
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

const topBookColumns = [
  { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, i) => i + 1 },
  { title: 'Tên sách', dataIndex: 'tenSach', key: 'tenSach', render: (t) => <Text strong>{t}</Text> },
  { title: 'Thể loại', dataIndex: 'tenTheLoai', key: 'tenTheLoai' },
  { title: 'Đã bán', dataIndex: 'soLuongDaBan', key: 'soLuongDaBan', align: 'center', render: (v) => <Tag color="blue">{v}</Tag> },
  {
    title: 'Doanh thu',
    dataIndex: 'doanhThu',
    key: 'doanhThu',
    render: (v) => <Text strong style={{ color: '#52c41a' }}>{(v || 0).toLocaleString('vi-VN')}₫</Text>,
  },
];

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    ordersThisMonth: 0,
    cancelledOrders: 0,
    yearlyChartData: Array.from({ length: 12 }, (_, i) => ({ month: `T${i + 1}`, value: 0 })),
    topBooks: [],
    recentOrders: [],
    productsCount: 0,
    todayStats: {
      newOrders: 0,
      processingOrders: 0,
      successfulOrders: 0,
      cancelledOrders: 0,
      todayRevenue: 0
    }
  });

  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        summary,
        topBooksList,
        recentOrdersRes,
        productsCount,
        todayStatusRes,
        totalRevenueRes,
        cancelledOrdersRes
      ] = await Promise.all([
        StatisticalService.getSummaryStatistics(),
        StatisticalService.getTop10BestSellingBooks(),
        StatisticalService.getDonHangGanNhat(),
        StatisticalService.getTongSanPhamHoatDong(),
        StatisticalService.getSoDonTheoTrangThaiTheoNgay(dayjs().format('YYYY-MM-DD')),
        StatisticalService.getTotalRevenue(),
        StatisticalService.getTotalCancelledOrders()
      ]);

      const currentMonthData = summary.chiTietTheoThang?.find(
        d => d.thang === currentMonth && d.nam === currentYear
      ) || { tongDoanhThu: 0, tongDonHang: 0 };

      const chartDataMap = new Map((summary.chiTietTheoThang || []).filter(d => d.nam === currentYear).map(d => [d.thang, d.tongDoanhThu]));
      const structuredChartData = Array.from({ length: 12 }, (_, i) => ({
        month: `T${i + 1}`,
        value: chartDataMap.get(i + 1) || 0
      }));

      const formattedRecentOrders = (recentOrdersRes || []).map((o, i) => ({
        key: i,
        code: o.maHoaDon,
        customer: o.hoTenKhachHang,
        date: dayjs(o.ngayTao).format('DD/MM/YYYY HH:mm'),
        total: (o.tongTienHang || 0) + (o.phiShip || 0) - (o.giamGia || 0),
        status: o.trangThai
      }));

      let newOrders = 0, processingOrders = 0, successfulOrders = 0, cancelledOrders = 0;
      (todayStatusRes?.theoTrangThai || []).forEach(item => {
        if (item.trangThai === 'CHO_XAC_NHAN') newOrders += item.soLuong;
        if (['DA_XAC_NHAN', 'DANG_CHUAN_BI_HANG'].includes(item.trangThai)) processingOrders += item.soLuong;
        if (item.trangThai === 'THANH_CONG') successfulOrders += item.soLuong;
        if (item.trangThai === 'DA_HUY') cancelledOrders += item.soLuong;
      });

      setDashboardData({
        totalRevenue: totalRevenueRes || 0,
        totalOrders: summary.tongDonHang || 0,
        ordersThisMonth: currentMonthData.tongDonHang || 0,
        cancelledOrders: cancelledOrdersRes || 0,
        yearlyChartData: structuredChartData,
        topBooks: topBooksList || [],
        recentOrders: formattedRecentOrders,
        productsCount: productsCount || 0,
        todayStats: {
          newOrders,
          processingOrders,
          successfulOrders,
          cancelledOrders,
          todayRevenue: todayStatusRes?.tongDoanhThuThanhCong || 0
        }
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiData = [
    {
      title: 'Tổng doanh thu',
      value: dashboardData.totalRevenue,
      prefix: '',
      suffix: '₫',
      icon: <DollarOutlined />,
      color: '#4096ff',
      bg: '#e6f4ff',
      trend: '+12.5%',
      up: true,
    },
    {
      title: 'Tổng đơn hàng',
      value: dashboardData.totalOrders,
      icon: <FileTextOutlined />,
      color: '#52c41a',
      bg: '#f6ffed',
      trend: '+8.3%',
      up: true,
    },
    {
      title: 'Đơn hàng tháng này',
      value: dashboardData.ordersThisMonth,
      icon: <ShoppingOutlined />,
      color: '#fa8c16',
      bg: '#fff7e6',
      trend: '+5.4%',
      up: true,
    },
    {
      title: 'Đơn hàng đã hủy',
      value: dashboardData.cancelledOrders,
      icon: <CloseCircleOutlined />,
      color: '#ff4d4f',
      bg: '#fff1f0',
      trend: '-2.1%',
      up: false,
    },
  ];

  const maxRevenue = Math.max(...dashboardData.yearlyChartData.map((d) => d.value), 1000000); // Tối thiểu 1 triệu để cột không quá cao nếu data nhỏ

  if (loading) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu tổng quan..." />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={async () => {
            try {
              let fileHandle = null;
              if (window.showSaveFilePicker) {
                fileHandle = await window.showSaveFilePicker({
                  suggestedName: `Dashboard_DreamBook_${new Date().getTime()}.xlsx`,
                  types: [{
                    description: 'Excel File',
                    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                  }]
                });
              }

              message.loading({ content: 'Đang chuẩn bị dữ liệu xuất Excel...', key: 'export' });
              const allOrdersRes = await getAllHoaDon();

              const exportData = {
                totalRevenue: dashboardData.totalRevenue,
                totalOrders: dashboardData.totalOrders,
                ordersThisMonth: dashboardData.ordersThisMonth,
                cancelledOrders: dashboardData.cancelledOrders,
                allOrders: allOrdersRes
              };

              const success = await exportDashboardExcel(exportData, fileHandle);
              if (success) {
                message.success({ content: 'Xuất file báo cáo thành công!', key: 'export', duration: 2 });
              } else if (success === false && fileHandle) {
                message.destroy('export');
              } else {
                message.error({ content: 'Không thể tạo file báo cáo. Vui lòng thử lại.', key: 'export', duration: 2 });
              }
            } catch (err) {
              if (err.name === 'AbortError') return;
              console.error(err);
              message.error({ content: 'Lỗi tải dữ liệu hóa đơn.', key: 'export', duration: 2 });
            }
          }}
        >
          Xuất báo cáo Excel
        </Button>
      </div>
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
                <span>Doanh thu theo tháng ({currentYear})</span>
              </div>
            }
            bordered={false}
            className="chart-card"
          >
            <div className="bar-chart">
              {dashboardData.yearlyChartData.map((d) => (
                <div key={d.month} className="bar-item">
                  <div className="bar-value">
                    {d.value > 0 ? (d.value >= 1000000 ? (d.value / 1000000).toFixed(1) + 'tr' : (d.value / 1000).toFixed(0) + 'k') : ''}
                  </div>
                  <div
                    className="bar"
                    style={{ height: `${(d.value / maxRevenue) * 160}px` }}
                    title={`Doanh thu ${d.month}: ${d.value.toLocaleString('vi-VN')}₫`}
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
                { label: 'Đơn hàng mới', value: dashboardData.todayStats.newOrders, color: '#4096ff' },
                { label: 'Đơn chờ xử lý', value: dashboardData.todayStats.processingOrders, color: '#fa8c16' },
                { label: 'Đã giao thành công', value: dashboardData.todayStats.successfulOrders, color: '#52c41a' },
                { label: 'Đơn bị hủy', value: dashboardData.todayStats.cancelledOrders, color: '#ff4d4f' },
                { label: 'Doanh thu hôm nay', value: formatMoneyShorthand(dashboardData.todayStats.todayRevenue), color: '#1677ff', isText: true },
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
              dataSource={dashboardData.recentOrders}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Top sách bán chạy" bordered={false} className="table-card">
            <Table
              columns={topBookColumns}
              dataSource={dashboardData.topBooks.map((b, i) => ({ ...b, key: i }))}
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
