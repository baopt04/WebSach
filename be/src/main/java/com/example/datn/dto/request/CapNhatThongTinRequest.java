package com.example.datn.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CapNhatThongTinRequest {

    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 5, message = "Họ tên phải từ 5 ký tự trở lên")
    private String hoTen;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số")
    private String soDienThoai;

    @NotNull(message = "Giới tính không được để trống")
    private Boolean gioiTinh;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate ngaySinh;
}
