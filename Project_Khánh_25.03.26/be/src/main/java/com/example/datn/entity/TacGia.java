package com.example.datn.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tac_gia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TacGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_tac_gia", nullable = false, length = 150)
    private String tenTacGia;

    @Column(name = "tieu_su", columnDefinition = "NVARCHAR(MAX)")
    private String tieuSu;

    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

    @JsonIgnore
    @OneToMany(mappedBy = "tacGia", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SachTacGia> sachTacGias;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        ngayCapNhat = LocalDateTime.now();
    }
}