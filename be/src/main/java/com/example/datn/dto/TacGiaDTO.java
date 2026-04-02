package com.example.datn.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class TacGiaDTO {
    private Integer id;
    private String tenTacGia;
    private String tieuSu;
}
