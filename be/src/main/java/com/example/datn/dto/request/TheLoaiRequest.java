package com.example.datn.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TheLoaiRequest {
    @NotBlank(message = "Tên thể loại không được để trống")
    private String tenTheLoai;
}

