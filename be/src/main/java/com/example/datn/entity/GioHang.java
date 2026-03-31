package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "gio_hang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GioHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_gio_hang")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_khach_hang")
    private TaiKhoan khachHang;

    @Column(name = "tong_tien")
    private BigDecimal tongTien;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;
}