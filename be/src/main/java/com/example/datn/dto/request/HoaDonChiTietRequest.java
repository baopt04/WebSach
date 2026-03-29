package com.example.datn.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class HoaDonChiTietRequest {
    private Integer idSach;
    private Integer soLuong;
    private BigDecimal donGia;
}
