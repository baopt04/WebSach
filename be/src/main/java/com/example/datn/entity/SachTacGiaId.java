package com.example.datn.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class SachTacGiaId implements Serializable {

    @Column(name = "id_sach")
    private Integer idSach;

    @Column(name = "id_tac_gia")
    private Integer idTacGia;
}