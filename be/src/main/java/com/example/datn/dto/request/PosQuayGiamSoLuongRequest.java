package com.example.datn.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosQuayGiamSoLuongRequest {

    @NotNull(message = "Số lượng giảm không được null")
    @Min(value = 1, message = "Số lượng giảm phải >= 1")
    private Integer soLuongGiam;
}
