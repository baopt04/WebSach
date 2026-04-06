package com.example.datn.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Thống kê đơn theo trạng thái trong một ngày (theo {@code ngayCapNhat}).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThongKeSoDonTrangThaiTheoNgayResponse {
    private LocalDate ngay;
    /** Tổng (tongTienHang - giamGia) các hóa đơn THANH_CONG có ngayCapNhat trong ngày */
    private BigDecimal tongDoanhThuThanhCong;
    private List<ThongKeSoDonTheoTrangThaiResponse> theoTrangThai;
}
