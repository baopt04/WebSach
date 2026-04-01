package com.example.datn.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.example.datn.enums.VoucherStatus;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MaGiamGiaRequest {

    @NotBlank(message = "Tên mã giảm giá không được để trống")
    private String tenMaGiamGia;

    @NotNull(message = "Giá trị giảm không được để trống")
    @Min(value = 0, message = "Giá trị giảm phải lớn hơn hoặc bằng 0")
    private BigDecimal giaTriGiam;

    @NotNull(message = "Tiền tối thiểu không được để trống")
    @Min(value = 0, message = "Tiền tối thiểu phải lớn hơn hoặc bằng 0")
    private BigDecimal tienToiThieu;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime ngayBatDau;

    @NotNull(message = "Ngày kết thúc không được để trống")
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime ngayKetThuc;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer soLuong;

    // Có thể bỏ qua valid trangThai vì BE sẽ tự tính bằng ngày,
    // tuy nhiên vẫn giữ để map data.
    private VoucherStatus trangThai;
}
