package com.example.datn.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class NhaXuatBanDTO {
    private Integer id;
    private String tenNxb;
    private String diaChi;
    private String soDienThoai;
    private LocalDateTime ngayCapNhat;
}
