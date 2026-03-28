package com.example.datn.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SachDTO {

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
    private String tenTheLoai;

    private Integer idNxb;
    private String tenNxb;

    private Integer idTacGia;
    private String tenTacGia;

    private String hinhAnh;

    private Boolean trangThai;
}
