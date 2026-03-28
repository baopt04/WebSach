package com.example.datn.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "sach")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sach {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_sach", unique = true, nullable = false, length = 20)
    private String maSach;

    @Column(name = "ma_vach", unique = true, length = 500)
    private String maVach;

    @Column(name = "ten_sach", nullable = false, length = 255)
    private String tenSach;

    @Column(name = "gia_ban", nullable = false, precision = 18, scale = 2)
    private BigDecimal giaBan;

    @Column(name = "so_luong")
    private Integer soLuong = 0;

    @Column(name = "so_trang")
    private Integer soTrang;

    @Column(name = "ngon_ngu", length = 50)
    private String ngonNgu;

    @Column(name = "nam_xuat_ban")
    private Integer namXuatBan;

    @Column(name = "kich_thuoc", length = 50)
    private String kichThuoc;

    @Column(name = "mo_ta", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    // FK → TheLoai
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_the_loai", referencedColumnName = "id")
    private TheLoai theLoai;

    // FK → NhaXuatBan
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nxb", referencedColumnName = "id")
    private NhaXuatBan nhaXuatBan;

    @Column(name = "trang_thai")
    private Boolean trangThai = true;

    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

    @JsonIgnore
    @OneToMany(mappedBy = "sach", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SachTacGia> sachTacGias;

    @JsonIgnore
    @OneToMany(mappedBy = "sach", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SachHinhAnh> hinhAnhs;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
        if (soLuong == null) soLuong = 0;
        if (trangThai == null) trangThai = true;
    }

    @PreUpdate
    protected void onUpdate() {
        ngayCapNhat = LocalDateTime.now();
    }
}