package com.example.datn.dto.response.giohang;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GioHangChiTietResponse {
    private Integer idGioHangChiTiet;
    private Integer idSach;
    private String tenSach;
    private String hinhAnh;
    private BigDecimal giaBan;
    private Integer soLuong;
    private BigDecimal tongTienChung;
}
