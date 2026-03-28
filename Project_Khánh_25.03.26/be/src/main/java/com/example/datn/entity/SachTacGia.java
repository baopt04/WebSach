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

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idSach")
    @JoinColumn(name = "id_sach")
    private Sach sach;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idTacGia")
    @JoinColumn(name = "id_tac_gia")
    private TacGia tacGia;

    @Column(name = "vai_tro", length = 100)
    private String vaiTro;  // Ví dụ: "Tác giả chính", "Đồng tác giả", "Dịch giả"

    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        ngayCapNhat = LocalDateTime.now();
    }
}