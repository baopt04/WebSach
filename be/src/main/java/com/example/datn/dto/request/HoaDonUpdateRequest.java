package com.example.datn.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class HoaDonUpdateRequest {
    private String hoTen;
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số")
    private String soDienThoai;
    @Email(message = "Email chưa đúng định dạng")
    private String email;
    private String diaChiGiaoHang;
    private BigDecimal phiShip;
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate ngayNhan;
    private String ghiChu;
}
