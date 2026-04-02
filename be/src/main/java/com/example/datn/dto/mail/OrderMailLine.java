package com.example.datn.dto.mail;

import java.math.BigDecimal;

/**
 * Một dòng sản phẩm trong email xác nhận đơn hàng.
 */
public record OrderMailLine(String tenSach, int soLuong, BigDecimal donGia, BigDecimal thanhTien) {
}
