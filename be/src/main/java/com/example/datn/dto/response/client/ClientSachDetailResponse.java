package com.example.datn.dto.response.client;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientSachDetailResponse {
    private Integer id;
    private String maSach;
    private String tenSach;
    private BigDecimal giaBan;
    private Integer soLuong;
    private String tenNhaXuatBan;
    private List<String> tenTacGias;
    private List<String> hinhAnhs;
    private String moTa;
    private Integer soTrang;
    private String ngonNgu;
    private Integer namXuatBan;
    private String kichThuoc;
    private String tenTheLoai;
}
