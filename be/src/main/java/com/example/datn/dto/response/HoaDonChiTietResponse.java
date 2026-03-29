package com.example.datn.dto.response;

import lombok.*;
import java.math.BigDecimal;
import com.example.datn.enums.OrderStatus;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class HoaDonChiTietResponse {
    private Integer id;
    private Integer idHoaDon;
    private Integer idSach;
    private String maSach;
    private String tenSach;
    private String hinhAnh;
    private Integer soLuong;
    private BigDecimal donGia;
    private OrderStatus trangThai;
}
