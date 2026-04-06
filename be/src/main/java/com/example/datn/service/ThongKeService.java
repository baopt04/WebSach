package com.example.datn.service;

import com.example.datn.dto.response.DoanhThuTheoThangResponse;
import com.example.datn.dto.response.HoaDonResponse;
import com.example.datn.dto.response.SachBanChayResponse;
import com.example.datn.dto.response.ThongKeSoDonTheoTrangThaiResponse;
import com.example.datn.dto.response.ThongKeSoDonTrangThaiTheoNgayResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ThongKeService {

    long getTotalOrders();

    BigDecimal getTotalRevenue();

    BigDecimal getRevenueByMonth(int month, int year);

    long getTotalOrdersByMonth(int month, int year);

    long getTotalCancelledOrders();

    List<SachBanChayResponse> getTop10BestSellingBooks();

    List<DoanhThuTheoThangResponse> getRevenueAndOrdersByMonths(int year);

    com.example.datn.dto.response.ThongKeTongHopResponse getThongKeTongHop();

    /** 10 đơn gần nhất theo ngayCapNhat, không lấy TAO_HOA_DON */
    List<HoaDonResponse> getMuoiDonHangGanNhat();

    /** Tổng số sách đang hoạt động (trangThai = true) */
    long getTongSoSanPhamDangHoatDong();

    /**
     * Số đơn theo từng trạng thái trong ngày (theo ngayCapNhat), không gồm TAO_HOA_DON.
     * Kèm tổng doanh thu đơn THANH_CONG (tongTienHang - giamGia) trong ngày đó.
     */
    ThongKeSoDonTrangThaiTheoNgayResponse getSoDonTheoTrangThaiTrongNgay(LocalDate ngay);
}
