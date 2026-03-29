package com.example.datn.dto.request;

import com.example.datn.enums.PaymentMethod;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
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
    private PaymentMethod paymentMethod;
    private List<HoaDonChiTietRequest> chiTiets;
}
