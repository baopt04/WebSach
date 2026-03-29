package com.example.datn.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MaGiamGiaResponse {
    private Integer id;
    private String maVoucher;
    private String tenMaGiamGia;
    private BigDecimal giaTriGiam;
    private BigDecimal tienToiThieu;
    private LocalDate  ngayBatDau;
    private LocalDate ngayKetThuc;
    private Integer soLuong;
    private Boolean trangThai;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;
}
