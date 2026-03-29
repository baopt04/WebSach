package com.example.datn.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoaDonDetailResponse {
    private HoaDonResponse hoaDon;
    private List<HoaDonChiTietResponse> chiTiets;
}
