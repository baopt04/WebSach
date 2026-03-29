package com.example.datn.dto.response;

import com.example.datn.enums.OrderStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichSuDonHangResponse {
    private Integer id;
    private Integer idHoaDon;
    private String tenNhanVien;
    private OrderStatus trangThai;
    private String ghiChu;
    private LocalDateTime ngayTao;
}
