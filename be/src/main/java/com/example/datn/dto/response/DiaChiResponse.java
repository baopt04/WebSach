package com.example.datn.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DiaChiResponse {
    private Integer id;
    private Integer idTaiKhoan;
    private String hoTen;
    private String soDienThoai;
    private String emailTaiKhoan;
    private Integer idTinhThanh;
    private String tinhThanh;
    private Integer idQuanHuyen;
    private String quanHuyen;
    private Integer idPhuongXa;
    private String phuongXa;
    private String diaChiChiTiet;
    private Boolean macDinh;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;
}
