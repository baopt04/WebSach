package com.example.datn.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NhaXuatBanRequest {
    @NotBlank(message = "Tên nhà xuất bản không được để trống")
    private String tenNxb;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String diaChi;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String soDienThoai;
}

