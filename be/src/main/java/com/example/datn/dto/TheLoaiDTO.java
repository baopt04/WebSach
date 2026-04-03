package com.example.datn.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class TheLoaiDTO {
    private Integer id;
    private String tenTheLoai;
    private LocalDateTime ngayCapNhat;
}
