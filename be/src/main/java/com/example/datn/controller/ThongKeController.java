package com.example.datn.controller;

import com.example.datn.dto.response.DoanhThuTheoThangResponse;
import com.example.datn.dto.response.SachBanChayResponse;
import com.example.datn.dto.response.ThongKeTongHopResponse;
import com.example.datn.service.ThongKeService;
import lombok.RequiredArgsConstructor;
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
}
