package com.example.datn.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SachHinhAnhDTO {
    private Integer id;
    private String duongDan;
    private Boolean laAnhChinh;
}
