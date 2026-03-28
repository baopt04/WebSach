package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "the_loai")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TheLoai {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_the_loai", nullable = false, length = 100)
    private String tenTheLoai;

    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

    @JsonIgnore
    @OneToMany(mappedBy = "theLoai", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
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