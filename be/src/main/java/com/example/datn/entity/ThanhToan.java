package com.example.datn.entity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "thanh_toan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThanhToan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_thanh_toan")
    private Integer idThanhToan;

    @ManyToOne
    @JoinColumn(name = "id_hoa_don")
    private HoaDon hoaDon;

    @ManyToOne
    @JoinColumn(name = "id_nhan_vien")
    private TaiKhoan nhanVien;

    @Column(name = "hinh_thuc")
    private String hinhThuc;

    @Column(name = "ma_giao_dich")
    private String maGiaoDich;

    @Column(name = "tong_tien")
    private BigDecimal tongTien;

    @Column(name = "trang_thai")
    private String trangThai;

    @Column(name = "ghi_chu")
    private String ghiChu;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;
}