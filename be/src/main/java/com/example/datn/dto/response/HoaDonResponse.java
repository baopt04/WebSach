package com.example.datn.dto.response;

import com.example.datn.enums.OrderStatus;
import com.example.datn.enums.PaymentMethod;
import com.example.datn.enums.PaymentStatus;
import com.example.datn.enums.TypeBill;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class HoaDonResponse {
    private Integer id;
    private String maHoaDon;
    private String hoTenKhachHang;
    private String soDienThoai;
    private String email;
    private String diaChiGiaoHang;
    private BigDecimal tongTienHang;
    private BigDecimal phiShip;
    private BigDecimal giamGia;
    private OrderStatus trangThai;
    private PaymentMethod phuongThuc;
//    private PaymentStatus thanhToan;
    private TypeBill loaiHoaDon;
    private String ghiChu;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;
}
