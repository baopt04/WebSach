package com.example.datn.controller;

import com.example.datn.dto.request.PosHoaDonCreateRequest;
import com.example.datn.dto.request.PosQuayThanhToanRequest;
import com.example.datn.dto.request.PosHoaDonThemHangRequest;
import com.example.datn.dto.response.HoaDonDetailResponse;
import com.example.datn.service.HoaDonService;
import com.example.datn.service.PosQuayBanHangService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/v1/pos/hoa-don")
@RequiredArgsConstructor
public class PosHoaDonController {

    private final HoaDonService hoaDonService;
    private final PosQuayBanHangService posQuayBanHangService;

    @PostMapping("/tao")
    public ResponseEntity<HoaDonDetailResponse> taoHoaDon(@RequestBody PosHoaDonCreateRequest request) {
        return ResponseEntity.ok(hoaDonService.taoHoaDonBanTaiQuay(request));
    }

    @PostMapping("/{id}/them-hang")
    public ResponseEntity<HoaDonDetailResponse> themHang(
            @PathVariable("id") Integer id,
            @Valid @RequestBody PosHoaDonThemHangRequest request) {
        return ResponseEntity.ok(hoaDonService.themHangBanTaiQuay(id, request));
    }

    @PostMapping("/{id}/thanh-toan")
    public ResponseEntity<HoaDonDetailResponse> thanhToan(
            @PathVariable("id") Integer id,
            @RequestBody(required = false) PosQuayThanhToanRequest request) {
        PosQuayThanhToanRequest body = request != null ? request : new PosQuayThanhToanRequest();
        return ResponseEntity.ok(posQuayBanHangService.thanhToan(id, body));
    }
}
