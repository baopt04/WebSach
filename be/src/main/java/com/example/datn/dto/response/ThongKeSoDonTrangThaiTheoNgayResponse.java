package com.example.datn.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThongKeSoDonTrangThaiTheoNgayResponse {
    private LocalDate ngay;

    private BigDecimal tongDoanhThuThanhCong;
    private List<ThongKeSoDonTheoTrangThaiResponse> theoTrangThai;
}
