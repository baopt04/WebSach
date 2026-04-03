package com.example.datn.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SachTacGiaDTO {
    private Integer idSach;
    private Integer idTacGia;
    private String tenTacGia;
    private String vaiTro;
    private LocalDateTime ngayCapNhat;
}
