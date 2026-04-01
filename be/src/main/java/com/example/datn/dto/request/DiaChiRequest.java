package com.example.datn.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DiaChiRequest {

    @NotNull(message = "ID Tài khoản không được để trống")
    private Integer idTaiKhoan;

    @NotNull(message = "ID Tỉnh/Thành không được để trống")
    private Integer idTinhThanh;

    @NotBlank(message = "Tên Tỉnh/Thành không được để trống")
    private String tinhThanh;

    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 3, message = "Họ tên phải từ 3 ký tự trở lên")
    private String hoTen;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số")
    private String soDienThoai;

    @NotNull(message = "ID Quận/Huyện không được để trống")
    private Integer idQuanHuyen;

    @NotBlank(message = "Tên Quận/Huyện không được để trống")
    private String quanHuyen;

    @NotBlank(message = "ID Phường/Xã không được để trống")
    private String idPhuongXa;

    @NotBlank(message = "Tên Phường/Xã không được để trống")
    private String phuongXa;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    private String diaChiChiTiet;
    private Boolean macDinh;
}
