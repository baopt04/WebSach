package com.example.datn.dto.request;

import com.example.datn.enums.PaymentMethod;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class HoaDonCreateRequest {
    private Integer idTaiKhoan;
    private String hoTen;
    private String soDienThoai;
    private String email;
    private String diaChiGiaoHang;
    private BigDecimal phiShip;
    private String ghiChu;
    private Integer idMaGiamGia;
    private BigDecimal tienGiamGia;
    private String maHoaDon;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate ngayNhan;
    private PaymentMethod phuongThucThanhToan;
    private List<HoaDonChiTietRequest> chiTiets;
}
