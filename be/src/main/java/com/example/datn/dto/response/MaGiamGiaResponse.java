package com.example.datn.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.example.datn.enums.VoucherStatus;
import com.example.datn.enums.VoucherType;

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
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime ngayBatDau;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime ngayKetThuc;
    private Integer soLuong;
    private VoucherStatus trangThai;
    private VoucherType voucherType;
    private BigDecimal giamToiDa;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;
}
