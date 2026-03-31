package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "nha_xuat_ban")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhaXuatBan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_nxb")
    private String tenNxb;
    @Column(name = "dia_chi")
    private String diaChi;

    @Column(name = "so_dien_thoai")
    private String soDienThoai;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;
}