package com.example.datn.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosQuayKhachHangLienHeResponse {
    private Integer id;
    private String hoTen;
    private String soDienThoai;
    private String email;
    private LocalDateTime ngayCapNhat;
}
