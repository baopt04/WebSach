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
public class SachBanChayResponse {
    private Integer idSach;
    private String tenSach;
    private String tenTheLoai;
    private Long soLuongDaBan;
    private BigDecimal doanhThu;
    private BigDecimal tongDoanhThuTheLoai;

    public SachBanChayResponse(Integer idSach, String tenSach, String tenTheLoai, Number soLuongDaBan, Number doanhThu) {
        this.idSach = idSach;
        this.tenSach = tenSach;
        this.tenTheLoai = tenTheLoai;
        this.soLuongDaBan = soLuongDaBan != null ? soLuongDaBan.longValue() : 0L;
        this.doanhThu = doanhThu != null ? new BigDecimal(doanhThu.toString()) : BigDecimal.ZERO;
    }
}
