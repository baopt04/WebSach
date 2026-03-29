package com.example.datn.dto.request;

import com.example.datn.enums.OrderStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TrangThaiHoaDonRequest {
    private OrderStatus orderStatus;
    private String ghiChu;
}
