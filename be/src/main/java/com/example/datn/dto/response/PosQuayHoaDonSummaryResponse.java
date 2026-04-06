package com.example.datn.dto.response;

import com.example.datn.enums.OrderStatus;
import com.example.datn.enums.TypeBill;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosQuayHoaDonSummaryResponse {
    private Integer id;
    private String maHoaDon;
    private String hoTen;
    private String soDienThoai;
    private String email;
    private BigDecimal tongTienHang;
    private OrderStatus trangThai;
    private TypeBill loaiHoaDon;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;
    /** Sản phẩm trong hóa đơn */
    private List<HoaDonChiTietResponse> chiTiets;
}
