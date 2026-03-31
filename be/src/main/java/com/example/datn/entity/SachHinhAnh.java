package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sach_hinh_anh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SachHinhAnh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_sach")
    private Sach sach;

    @Column(name = "duong_dan")
    private String duongDan;

    @Column(name = "la_anh_chinh")
    private Boolean laAnhChinh;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

}
