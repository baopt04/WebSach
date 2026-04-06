package com.example.datn.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosQuayThemSachRequest {

    @NotNull(message = "ID sách không được null")
    private Integer idSach;

    @NotNull(message = "Số lượng không được null")
    @Min(value = 1, message = "Số lượng phải >= 1")
    private Integer soLuong;
}
