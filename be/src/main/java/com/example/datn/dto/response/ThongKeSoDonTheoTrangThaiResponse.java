package com.example.datn.dto.response;

import com.example.datn.enums.OrderStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThongKeSoDonTheoTrangThaiResponse {
    private OrderStatus trangThai;
    private Long soLuong;
}
