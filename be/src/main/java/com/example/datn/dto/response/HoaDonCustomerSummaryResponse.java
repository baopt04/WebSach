package com.example.datn.dto.response;

import com.example.datn.enums.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class HoaDonCustomerSummaryResponse {
    private Integer id;
    private String maHoaDon;
    private OrderStatus trangThai;
    private BigDecimal tongTienHang;
    private BigDecimal phiShip;
    private BigDecimal giamGia;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;

    private List<SanPhamTomTatResponse> sanPhams;

}
