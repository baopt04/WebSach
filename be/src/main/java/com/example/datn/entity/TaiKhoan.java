package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;


import com.example.datn.enums.AccountStatus;
import com.example.datn.enums.Role;
import jakarta.persistence.*;
import lombok.*;



@Entity
@Table(name = "tai_khoan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaiKhoan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "ma_tai_khoan")
    private String maTaiKhoan;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "mat_khau", nullable = false)
    private String matKhau;

    @Column(name = "ho_ten", nullable = false)
    private String hoTen;

    @Column(name = "so_dien_thoai")
    private String soDienThoai;

    @Enumerated(EnumType.STRING)
    @Column(name = "vai_tro")
    private Role vaiTro = Role.ROLE_CUSTOMER;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai")
    private AccountStatus trangThai = AccountStatus.ACTIVATED;

    @Column(name = "ngay_sinh")
    private LocalDate ngaySinh;

    @Column(name = "gioi_tinh")
    private Boolean gioiTinh;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;
}