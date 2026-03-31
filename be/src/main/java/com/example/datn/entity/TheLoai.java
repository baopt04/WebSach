package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


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

    @Column(name = "ten_the_loai")
    private String tenTheLoai;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;
}