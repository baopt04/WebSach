package com.example.datn.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

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

    @Column(name = "ten_nxb", nullable = false, length = 150)
    private String tenNxb;

    @Column(name = "dia_chi", length = 255)
    private String diaChi;

    @Column(name = "so_dien_thoai", length = 15)
    private String soDienThoai;

    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

    @JsonIgnore
    @OneToMany(mappedBy = "nhaXuatBan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Sach> danhSachSach;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        ngayCapNhat = LocalDateTime.now();
    }
}