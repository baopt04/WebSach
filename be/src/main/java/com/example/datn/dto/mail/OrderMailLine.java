package com.example.datn.dto.mail;

import java.math.BigDecimal;


public record OrderMailLine(String tenSach, int soLuong, BigDecimal donGia, BigDecimal thanhTien) {
}
