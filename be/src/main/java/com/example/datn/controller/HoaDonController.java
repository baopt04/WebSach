package com.example.datn.controller;

import com.example.datn.dto.request.HoaDonUpdateRequest;
import com.example.datn.dto.request.TrangThaiHoaDonRequest;
import com.example.datn.dto.response.HoaDonDetailResponse;
import com.example.datn.dto.response.HoaDonResponse;
import com.example.datn.dto.response.LichSuDonHangResponse;
import com.example.datn.service.HoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/v1/hoa-don")
@RequiredArgsConstructor
public class HoaDonController {

    private final HoaDonService hoaDonService;

    @GetMapping
    public ResponseEntity<List<HoaDonResponse>> getAllHoaDon() {
        return ResponseEntity.ok(hoaDonService.getAllHoaDon());
    }

    @GetMapping("/chi-tiet/{id}")
    public ResponseEntity<HoaDonDetailResponse> getHoaDonChiTiet(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(hoaDonService.getHoaDonChiTietByHoaDonId(id));
    }

    @GetMapping("/lich-su-hoa-don/{id}")
    public ResponseEntity<List<LichSuDonHangResponse>> getLichSuByHoaDonId(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(hoaDonService.getLichSuByHoaDonId(id));
    }

    @PutMapping("/chuyen-trang-thai/{id}")
    public ResponseEntity<HoaDonResponse> changeOrderStatus(
            @PathVariable("id") Integer id,
            @RequestBody TrangThaiHoaDonRequest request) {
        return ResponseEntity.ok(hoaDonService.changeOrderStatus(id, request));
    }

    @PutMapping("/cap-nhat-don-hang/{id}")
    public ResponseEntity<HoaDonResponse> updateHoaDonThongTin(
            @PathVariable("id") Integer id,
            @RequestBody HoaDonUpdateRequest request) {
        return ResponseEntity.ok(hoaDonService.updateHoaDon(id, request));
    }

    @GetMapping("/search-text")
    public ResponseEntity<List<HoaDonResponse>> searchByKeyword(@RequestParam("keyword") String keyword) {
        return ResponseEntity.ok(hoaDonService.searchHoaDonByKeyword(keyword));
    }

    @GetMapping("/search-date")
    public ResponseEntity<List<HoaDonResponse>> searchByDateRange(
            @RequestParam("tuNgay") @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate tuNgay,
            @RequestParam("denNgay") @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate denNgay) {
        return ResponseEntity.ok(hoaDonService.searchHoaDonByDateRange(tuNgay, denNgay));
    }
}
