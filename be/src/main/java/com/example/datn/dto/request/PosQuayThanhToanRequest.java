package com.example.datn.dto.request;

import com.example.datn.enums.PaymentMethod;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosQuayThanhToanRequest {

    private PaymentMethod phuongThucThanhToan;

    private String ghiChu;


    private String hinhThucNhanHang;

    private String diaChiGiaoHang;

    private BigDecimal phiShip;

    private LocalDate ngayNhan;

    private String maVoucher;
    private BigDecimal soTienGiamVoucher;

    private Integer idKhachHang;


    private String hoTen;
    private String soDienThoai;
    private String email;
}
