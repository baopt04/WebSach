package com.example.datn.entity;

import com.example.datn.enums.VoucherStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ma_giam_gia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaGiamGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_voucher")
    private String maVoucher;

    @Column(name = "ten_ma_giam_gia")
    private String tenMaGiamGia;

    @Column(name = "gia_tri_giam")
    private BigDecimal giaTriGiam;

    @Column(name = "tien_toi_thieu")
    private BigDecimal tienToiThieu;

    @Column(name = "ngay_bat_dau")
    private LocalDateTime ngayBatDau;

    @Column(name = "ngay_ket_thuc")
    private LocalDateTime  ngayKetThuc;

    @Column(name = "so_luong")
    private Integer soLuong;
    @Column(name = "trang_thai")
    @Enumerated(EnumType.STRING)
    private VoucherStatus trangThai;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;
    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
        ngayCapNhat = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        ngayCapNhat = LocalDateTime.now();
    }
}