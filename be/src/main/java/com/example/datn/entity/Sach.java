package com.example.datn.entity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;


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

    @Column(name = "ma_sach")
    private String maSach;

    @Column(name = "ma_vach")
    private String maVach;

    @Column(name = "ten_sach")
    private String tenSach;

    @Column(name = "gia_ban")
    private BigDecimal giaBan;

    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "so_trang")
    private Integer soTrang;

    @Column(name = "ngon_ngu")
    private String ngonNgu;

    @Column(name = "nam_xuat_ban")
    private Integer namXuatBan;

    @Column(name = "kich_thuoc")
    private String kichThuoc;

    @Column(columnDefinition = "NVARCHAR(MAX)" , name = "mo_ta")
    private String moTa;

    @ManyToOne
    @JoinColumn(name = "id_the_loai")
    private TheLoai theLoai;

    @ManyToOne
    @JoinColumn(name = "id_nxb")
    private NhaXuatBan nhaXuatBan;
    @Column(name = "trang_thai")
    private Boolean trangThai;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;
}