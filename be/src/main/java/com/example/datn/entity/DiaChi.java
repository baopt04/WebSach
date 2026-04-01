package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDateTime;


@Entity
@Table(name = "dia_chi")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaChi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_tai_khoan")
    private TaiKhoan taiKhoan;

    @Column(name = "ho_ten")
    private String hoTen;

    @Column(name = "so_dien_thoai")
    private String soDienThoai;

    @Column(name = "id_tinh_thanh")
    private Integer idTinhThanh;

    @Column(name = "tinh_thanh")
    private String tinhThanh;

    @Column(name = "id_quan_huyen")
    private Integer idQuanHuyen;

    @Column(name = "quan_huyen")
    private String quanHuyen;

    @Column(name = "id_phuong_xa")
    private String idPhuongXa;

    @Column(name = "phuong_xa")
    private String phuongXa;

    @Column(name = "dia_chi_chi_tiet")
    private String diaChiChiTiet;

    @Column(name = "mac_dinh")
    private Boolean macDinh;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;
}
