package com.example.datn.dto.response;

import com.example.datn.enums.AccountStatus;
import com.example.datn.enums.Role;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TaiKhoanResponse {
    private Integer id;
    private String maTaiKhoan;
    private String email;
    private String hoTen;
    private String soDienThoai;
    private Role vaiTro;
    private AccountStatus trangThai;
    
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate ngaySinh;
    
    private Boolean gioiTinh;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;
}
