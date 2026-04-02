package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sach_tac_gia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SachTacGia {

    @EmbeddedId
    private SachTacGiaId id;

    @ManyToOne
    @MapsId("idSach")
    @JoinColumn(name = "id_sach")
    private Sach sach;

    @ManyToOne
    @MapsId("idTacGia")
    @JoinColumn(name = "id_tac_gia")
    private TacGia tacGia;

    @Column(name = "vai_tro")
    private String vaiTro;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;
}