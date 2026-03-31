package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ma_giam_gia_chi_tiet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaGiamGiaChiTiet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_ma_giam_gia")
    private MaGiamGia maGiamGia;
    @OneToOne
    @JoinColumn(name = "id_hoa_don", unique = true)
    private HoaDon hoaDon;
    @Column(name = "so_tien_giam")
    private BigDecimal soTienGiam;
    @Column(name = "tien_truoc_khi_giam")
    private BigDecimal tienTruocKhiGiam;
    @Column(name = "tien_sau_khi_giam")
    private BigDecimal tienSauKhiGiam;
    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;
}