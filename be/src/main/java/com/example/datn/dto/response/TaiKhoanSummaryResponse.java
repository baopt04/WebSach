package com.example.datn.dto.response;

import com.example.datn.enums.AccountStatus;
import com.example.datn.enums.Role;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class TaiKhoanSummaryResponse {
    private Integer id;
    private String maTaiKhoan;
    private String hoTen;
    private String email;
    private String soDienThoai;
    private LocalDate ngaySinh;
    private Role vaiTro;
    private AccountStatus trangThai;
}
