package com.example.datn.dto.response.client;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientSanPhamResponse {
    private Integer id;
    private String tenSach;
    private BigDecimal giaBan;
    private Integer soLuong;
    private String tenNhaXuatBan;
    private List<String> tenTacGias;
    private List<String> hinhAnhs;
}
