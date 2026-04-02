package com.example.datn.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThongKeTongHopResponse {
    private Long tongDonHang;
    private BigDecimal tongDoanhThu;
    private List<DoanhThuTheoThangResponse> chiTietTheoThang;
}
