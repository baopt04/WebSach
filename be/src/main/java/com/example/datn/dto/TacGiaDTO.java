package com.example.datn.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class TacGiaDTO {
    private Integer id;
    private String tenTacGia;
    private String tieuSu;
    private LocalDateTime ngayCapNhat;
}
