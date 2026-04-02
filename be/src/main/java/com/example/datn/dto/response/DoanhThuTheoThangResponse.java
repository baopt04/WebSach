package com.example.datn.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoanhThuTheoThangResponse {
    private Integer thang;
    private Integer nam;
    private BigDecimal tongDoanhThu;
    private Long tongDonHang;
}
