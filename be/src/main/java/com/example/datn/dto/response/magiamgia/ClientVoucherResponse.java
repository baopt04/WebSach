package com.example.datn.dto.response.magiamgia;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ClientVoucherResponse {
    private Integer id;
    private String maVoucher;
    private String tenMaGiamGia;
    private BigDecimal giaTriGiam;
    private BigDecimal tienToiThieu;
    private Integer soLuong;
    private LocalDateTime ngayKetThuc;
}
