package com.example.datn.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
public class DoanhThuTheoTheLoaiResponse {
    private String tenTheLoai;
    private Long soLuongDaBan;
    private BigDecimal tongDoanhThu;

    public DoanhThuTheoTheLoaiResponse(String tenTheLoai, Number soLuongDaBan, Number tongDoanhThu) {
        this.tenTheLoai = tenTheLoai;
        this.soLuongDaBan = soLuongDaBan != null ? soLuongDaBan.longValue() : 0L;
        this.tongDoanhThu = tongDoanhThu != null ? new BigDecimal(tongDoanhThu.toString()) : BigDecimal.ZERO;
    }
}
