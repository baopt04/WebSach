import * as XLSX from 'xlsx';


export const exportStatisticsToExcel = (stats) => {
  try {
    const { totalOrders, totalRevenue, cancelledOrders, topBooks, yearlyChartData } = stats;

    const summaryData = [
      ['BÁO CÁO THỐNG KÊ TỔNG QUAN'],
      ['Ngày xuất', new Date().toLocaleString('vi-VN')],
      [],
      ['Chỉ số', 'Giá trị', 'Đơn vị'],
      ['Tổng doanh thu', totalRevenue, 'VNĐ'],
      ['Tổng đơn hàng', totalOrders, 'Đơn'],
      ['Đơn hàng đã hủy', cancelledOrders, 'Đơn'],
      ['Doanh thu bình quân / Đơn', totalOrders > 0 ? totalRevenue / totalOrders : 0, 'VNĐ'],
      ['Tỷ lệ hủy đơn', totalOrders > 0 ? (cancelledOrders / (totalOrders + cancelledOrders) * 100).toFixed(2) : 0, '%'],
    ];

    // 2. Sheet Diễn biến theo tháng
    const monthlyHeaders = [['Năm', 'Tháng', 'Doanh thu (VNĐ)', 'Số lượng đơn hàng']];
    const monthlyRows = (yearlyChartData || []).map(d => [
      d.nam,
      d.thang,
      d.tongDoanhThu,
      d.tongDonHang
    ]);
    const monthlyData = [...monthlyHeaders, ...monthlyRows];

    // 3. Sheet Top sản phẩm
    const productsHeaders = [['STT', 'Tên sách', 'Thể loại', 'Số lượng đã bán', 'Doanh thu (VNĐ)']];
    const productsRows = (topBooks || []).map((b, i) => [
      i + 1,
      b.tenSach,
      b.tenTheLoai,
      b.soLuongDaBan,
      b.doanhThu
    ]);
    const productsData = [...productsHeaders, ...productsRows];

    // Tạo Workbook
    const wb = XLSX.utils.book_new();

    // Thêm các sheets
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    const wsMonthly = XLSX.utils.aoa_to_sheet(monthlyData);
    const wsProducts = XLSX.utils.aoa_to_sheet(productsData);

    // Định dạng cột (độ rộng)
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 10 }];
    wsMonthly['!cols'] = [{ wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 20 }];
    wsProducts['!cols'] = [{ wch: 5 }, { wch: 40 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng quan');
    XLSX.utils.book_append_sheet(wb, wsMonthly, 'Diễn biến theo tháng');
    XLSX.utils.book_append_sheet(wb, wsProducts, 'Top sản phẩm');

    // Xuất file
    const fileName = `Bao_cao_thong_ke_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);

    return true;
  } catch (error) {
    console.error('Lỗi khi xuất Excel:', error);
    return false;
  }
};
