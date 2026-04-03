package com.example.datn.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TacGiaRequest {
    @NotBlank(message = "Tên tác giả không được để trống")
    private String tenTacGia;

    private String tieuSu;
}

