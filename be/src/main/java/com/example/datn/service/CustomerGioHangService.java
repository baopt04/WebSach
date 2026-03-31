package com.example.datn.service;

import com.example.datn.dto.request.giohang.GioHangRequest;
import com.example.datn.dto.response.giohang.GioHangResponse;

public interface CustomerGioHangService {
    GioHangResponse getCartDetails(Integer idKhachHang);
    String addCartItem(Integer idKhachHang, GioHangRequest request);
    String updateQuantity(Integer idKhachHang, Integer idGioHangChiTiet, Integer quantity);
    String removeCartItem(Integer idKhachHang, Integer idGioHangChiTiet);
}
