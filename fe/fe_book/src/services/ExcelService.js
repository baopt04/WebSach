import * as XLSX from 'xlsx';

export const exportDashboardExcel = async (stats, fileHandle = null) => {
  try {
    const { totalRevenue, totalOrders, ordersThisMonth, cancelledOrders, allOrders } = stats;

    const data = [];
    
    // Tiêu đề cửa hàng
    data.push(['THÔNG TIN CỬA HÀNG']);
    data.push(['Tên cửa hàng:', 'DREAM BOOK']);
    data.push(['Địa chỉ:', 'Trịnh Văn Bô, Nam Từ Liêm, Hà Nội']);
    data.push(['Ngày xuất báo cáo:', new Date().toLocaleString('vi-VN')]);
    data.push([]);
    data.push([]);

    // KPI Boxes structure
    data.push(['BÁO CÁO THỐNG KÊ TỔNG QUAN']);
    data.push(['TỔNG DOANH THU', 'TỔNG ĐƠN HÀNG', 'ĐƠN HÀNG THÁNG NÀY', 'ĐƠN HÀNG ĐÃ HỦY']);
    data.push([
      totalRevenue ? totalRevenue.toLocaleString('vi-VN') + ' ₫' : '0 ₫',
      totalOrders ? totalOrders.toLocaleString('vi-VN') : '0',
      ordersThisMonth ? ordersThisMonth.toLocaleString('vi-VN') : '0',
      cancelledOrders ? cancelledOrders.toLocaleString('vi-VN') : '0'
    ]);
    data.push([]);
    data.push([]);

    // Lưới hóa đơn
    data.push(['TỔNG CÁC HÓA ĐƠN TRONG HỆ THỐNG']);
    data.push([
      'STT', 
      'Mã hóa đơn', 
      'Khách hàng', 
      'Số điện thoại',
      'Ngày tạo', 
      'Loại đơn', 
      'Tổng tiền (VNĐ)', 
      'Trạng thái'
    ]);
    
    const statusMap = {
      CHO_XAC_NHAN: 'Chờ xác nhận',
      DA_XAC_NHAN: 'Đã xác nhận',
      DANG_CHUAN_BI_HANG: 'Đang chuẩn bị',
      DANG_GIAO: 'Đang giao',
      DA_THANH_TOAN: 'Đã thanh toán',
      THANH_CONG: 'Thành công',
      DA_HUY: 'Đã hủy',
    };

    (allOrders || []).forEach((o, i) => {
       data.push([
         i + 1,
         o.maHoaDon || '',
         o.hoTenKhachHang || '',
         o.soDienThoaiKhachHang || '',
         o.ngayTao ? new Date(o.ngayTao).toLocaleString('vi-VN') : '',
         o.loaiHoaDon === 'BAN_ONLINE' ? 'Online' : 'Tại quầy',
         (o.tongTienHang || 0) + (o.phiShip || 0) - (o.giamGia || 0),
         statusMap[o.trangThai] || o.trangThai
       ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!cols'] = [
      { wch: 10 }, // STT
      { wch: 20 }, // Mã HD
      { wch: 30 }, // Khách hàng
      { wch: 20 }, // SĐT
      { wch: 25 }, // Ngày tạo
      { wch: 20 }, // Loại đơn
      { wch: 20 }, // Tổng tiền
      { wch: 20 }  // Trạng thái
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');

    const fileName = `Dashboard_DreamBook_${new Date().getTime()}.xlsx`;

    if (fileHandle) {
      const writable = await fileHandle.createWritable();
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      await writable.write(excelBuffer);
      await writable.close();
    } else {
      XLSX.writeFile(wb, fileName);
    }

    return true;
  } catch (error) {
    if (error.name === 'AbortError') {
      return false; // Người dùng hủy hộp thoại lưu
    }
    console.error('Lỗi khi xuất Excel:', error);
    return false;
  }
};

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
