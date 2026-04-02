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
    private String maVach;
    private String tenSach;
    private BigDecimal giaBan;
    private Integer soLuong;
    private Integer soTrang;
    private String ngonNgu;
    private Integer namXuatBan;
    private String kichThuoc;
    private String moTa;

    private Integer idTheLoai;
    private Integer idNxb;

    private String tenTheLoai;
    private String tenNxb;

    private String duongDanAnh;

    private Boolean trangThai;
}
