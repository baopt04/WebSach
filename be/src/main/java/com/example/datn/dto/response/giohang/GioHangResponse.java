package com.example.datn.dto.response.giohang;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GioHangResponse {
    private Integer idGioHang;
    private BigDecimal tongTien;
    private List<GioHangChiTietResponse> chiTietList;
}
