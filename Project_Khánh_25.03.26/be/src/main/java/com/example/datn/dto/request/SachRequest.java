package com.example.datn.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SachRequest {

    @NotBlank(message = "Mã sách không được để trống")
    private String maSach;

    private String maVach;

    @NotBlank(message = "Tên sách không được để trống")
    private String tenSach;

    @NotNull(message = "Giá bán không được null")
    @DecimalMin(value = "0", message = "Giá bán phải >= 0")
    private BigDecimal giaBan;

    @NotNull(message = "Số lượng không được null")
    @Min(value = 0, message = "Số lượng >= 0")
    private Integer soLuong;

    private Integer soTrang;
    private String ngonNgu;
    private Integer namXuatBan;
    private String kichThuoc;
    private String moTa;


    @NotNull(message = "Phải chọn thể loại")
    private Integer idTheLoai;

    @NotNull(message = "Phải chọn nhà xuất bản")
    private Integer idNxb;

    private String duongDanAnh;

}