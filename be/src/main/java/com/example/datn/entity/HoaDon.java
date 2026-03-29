package com.example.datn.entity;
import com.example.datn.enums.TypeBill;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.datn.enums.OrderStatus;
import com.example.datn.enums.PaymentMethod;
import com.example.datn.enums.PaymentStatus;


@Entity
@Table(name = "hoa_don")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_hoa_don")
    private String maHoaDon;

    @ManyToOne
    @JoinColumn(name = "id_khach_hang")
    private TaiKhoan khachHang;

    @ManyToOne
    @JoinColumn(name = "id_nhan_vien")
    private TaiKhoan nhanVien;

    @Column(name = "ho_ten")
    private String hoTen;

    @Column(name = "so_dien_thoai")
    private String soDienThoai;

    private String email;

    @Column(name = "dia_chi_giao_hang")
    private String diaChiGiaoHang;

    @Column(name = "tong_tien_hang")
    private BigDecimal tongTienHang;

    @Column(name = "phi_ship")
    private BigDecimal phiShip;

    @Column(name = "giam_gia")
    private BigDecimal giamGia;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai")
    private OrderStatus trangThai = OrderStatus.TAO_HOA_DON;

    @Enumerated(EnumType.STRING)
    @Column(name = "phuong_thuc")
    private PaymentMethod phuongThuc = PaymentMethod.TIEN_MAT;

//    @Enumerated(EnumType.STRING)
//    @Column(name = "thanh_toan")
//    private PaymentStatus thanhToan = PaymentStatus.CHUA_THANH_TOAN;
    @Enumerated(EnumType.STRING)
    @Column(name = "loai_hoa_don")
    private TypeBill loaiHoaDon = TypeBill.OFFLINE;

    @Column(name = "ma_giao_dich_vnpay")
    private String maGiaoDichVnpay;

    @Column(name = "ngay_xac_nhan")
    private LocalDateTime ngayXacNhan;

    @Column(name = "ngay_giao_thanh_cong")
    private LocalDateTime ngayGiaoThanhCong;

    @Column(name = "ngay_nhan")
    private LocalDate ngayNhan;

    @Column(name = "ghi_chu")
    private String ghiChu;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;
}
