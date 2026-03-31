package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "gio_hang_chi_tiet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GioHangChiTiet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_gio_hang")
    private GioHang gioHang;

    @ManyToOne
    @JoinColumn(name = "id_sach")
    private Sach sach;

    @Column(name = "so_luong")
    private Integer soLuong;

    private BigDecimal gia;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;
}