package com.example.datn.dto.response;

import lombok.*;

import java.math.BigDecimal;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SanPhamTomTatResponse {
    private Integer idSach;
    private String tenSach;
    private String hinhAnh;
    private BigDecimal donGia;
    private Integer soLuong;
}
