package com.example.datn.dto.request;
import lombok.Data;

@Data
public class RegisterRequest {
    private String tenDangNhap;
    private String matKhau;
    private String hoTen;
    private String email;
    private String soDienThoai;
}
