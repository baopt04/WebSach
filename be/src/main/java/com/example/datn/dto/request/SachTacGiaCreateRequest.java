package com.example.datn.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SachTacGiaCreateRequest {
    @NotNull(message = "ID sách không được null")
    private Integer idSach;

    @NotNull(message = "ID tác giả không được null")
    private Integer idTacGia;

    private String vaiTro;
}

