package com.example.datn.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosHoaDonCreateRequest {
    /** Khách vãng lai — có thể để trống */
    private String hoTen;
    private String soDienThoai;
    private String email;
    private String ghiChu;
    /** Nếu khách có tài khoản */
    private Integer idKhachHang;
}
