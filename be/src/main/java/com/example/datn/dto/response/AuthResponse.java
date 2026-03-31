package com.example.datn.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class AuthResponse {
    private String token;

    private String email;
    private String hoTen;
    private String soDienThoai;
    private Boolean gioiTinh;
    private LocalDate ngaySinh;

    private String role;
}
