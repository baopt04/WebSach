package com.example.datn.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SachResponse {

    private Integer id;
    private String maSach;
    private String tenSach;
    private BigDecimal giaBan;
    private Integer soLuong;
    private String tenTheLoai;
    private String tenNxb;
    private String duongDanAnh;
    private Boolean trangThai;
}