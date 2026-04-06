package com.example.datn.controller;

import com.example.datn.dto.response.DoanhThuTheoThangResponse;
import com.example.datn.dto.response.HoaDonResponse;
import com.example.datn.dto.response.SachBanChayResponse;
import com.example.datn.dto.response.ThongKeSoDonTrangThaiTheoNgayResponse;
import com.example.datn.dto.response.ThongKeTongHopResponse;
import com.example.datn.service.ThongKeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/v1/thong-ke")
@RequiredArgsConstructor
public class ThongKeController {

    private final ThongKeService thongKeService;

    @GetMapping("/tong-don-hang")
    public ResponseEntity<Long> getTotalOrders() {
        return ResponseEntity.ok(thongKeService.getTotalOrders());
    }

    @GetMapping("/tong-doanh-thu")
    public ResponseEntity<BigDecimal> getTotalRevenue() {
        return ResponseEntity.ok(thongKeService.getTotalRevenue());
    }

    @GetMapping("/doanh-thu-thang")
    public ResponseEntity<BigDecimal> getRevenueByMonth(
            @RequestParam(name = "month", required = false) Integer month,
            @RequestParam(name = "year", required = false) Integer year) {
        if (month == null) month = LocalDate.now().getMonthValue();
        if (year == null) year = LocalDate.now().getYear();
        return ResponseEntity.ok(thongKeService.getRevenueByMonth(month, year));
    }

    @GetMapping("/tong-don-hang-thang")
    public ResponseEntity<Long> getTotalOrdersByMonth(
            @RequestParam(name = "month", required = false) Integer month,
            @RequestParam(name = "year", required = false) Integer year) {
        if (month == null) month = LocalDate.now().getMonthValue();
        if (year == null) year = LocalDate.now().getYear();
        return ResponseEntity.ok(thongKeService.getTotalOrdersByMonth(month, year));
    }

    @GetMapping("/tong-don-huy")
    public ResponseEntity<Long> getTotalCancelledOrders() {
        return ResponseEntity.ok(thongKeService.getTotalCancelledOrders());
    }

    @GetMapping("/top-sach-ban-chay")
    public ResponseEntity<List<SachBanChayResponse>> getTop10BestSellingBooks() {
        return ResponseEntity.ok(thongKeService.getTop10BestSellingBooks());
    }

    @GetMapping("/doanh-thu-theo-thang")
    public ResponseEntity<List<DoanhThuTheoThangResponse>> getRevenueAndOrdersByMonths(
            @RequestParam(name = "year", required = false) Integer year) {
        if (year == null) year = LocalDate.now().getYear();
        return ResponseEntity.ok(thongKeService.getRevenueAndOrdersByMonths(year));
    }

    @GetMapping("/tong-hop")
    public ResponseEntity<ThongKeTongHopResponse> getThongKeTongHop() {
        return ResponseEntity.ok(thongKeService.getThongKeTongHop());
    }

    /** 10 đơn cập nhật gần nhất (ngayCapNhat), không gồm TAO_HOA_DON */
    @GetMapping("/don-hang-gan-nhat")
    public ResponseEntity<List<HoaDonResponse>> getMuoiDonHangGanNhat() {
        return ResponseEntity.ok(thongKeService.getMuoiDonHangGanNhat());
    }

    /** Tổng số sản phẩm (sách) đang hoạt động: trangThai = true */
    @GetMapping("/tong-san-pham-hoat-dong")
    public ResponseEntity<Long> getTongSanPhamHoatDong() {
        return ResponseEntity.ok(thongKeService.getTongSoSanPhamDangHoatDong());
    }

    /**
     * Số đơn theo từng trạng thái trong một ngày (mặc định hôm nay), theo ngayCapNhat (phù hợp đơn POS thanh toán trong ngày).
     * Không gồm TAO_HOA_DON. Kèm tongDoanhThuThanhCong = tổng (tongTienHang - giamGia) đơn THANH_CONG trong ngày.
     */
    @GetMapping("/so-don-theo-trang-thai-ngay")
    public ResponseEntity<ThongKeSoDonTrangThaiTheoNgayResponse> getSoDonTheoTrangThaiTrongNgay(
            @RequestParam(name = "ngay", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngay) {
        return ResponseEntity.ok(thongKeService.getSoDonTheoTrangThaiTrongNgay(ngay));
    }
}
