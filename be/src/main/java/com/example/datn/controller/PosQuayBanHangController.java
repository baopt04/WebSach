package com.example.datn.controller;

import com.example.datn.dto.request.PosQuayGiamSoLuongRequest;
import com.example.datn.dto.request.PosQuayKhachHangNhanhRequest;
import com.example.datn.dto.request.PosQuayThanhToanRequest;
import com.example.datn.dto.request.PosQuayThemSachRequest;
import com.example.datn.dto.response.HoaDonDetailResponse;
import com.example.datn.dto.response.PosQuayHoaDonSummaryResponse;
import com.example.datn.dto.response.PosQuayKhachHangLienHeResponse;
import com.example.datn.dto.response.SachResponse;
import com.example.datn.service.PosQuayBanHangService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/v1/pos-quay")
@RequiredArgsConstructor
public class PosQuayBanHangController {

    private final PosQuayBanHangService posQuayBanHangService;

    @GetMapping("/hoa-don")
    public ResponseEntity<List<PosQuayHoaDonSummaryResponse>> listHoaDonTaoHoaDon() {
        return ResponseEntity.ok(posQuayBanHangService.listHoaDonTrangThaiTaoHoaDon());
    }

    @PostMapping("/hoa-don/trong")
    public ResponseEntity<HoaDonDetailResponse> taoHoaDonTrong() {
        return ResponseEntity.ok(posQuayBanHangService.taoHoaDonTrong());
    }

    @GetMapping("/khach-hang/lien-he")
    public ResponseEntity<List<PosQuayKhachHangLienHeResponse>> listLienHeKhachHang() {
        return ResponseEntity.ok(posQuayBanHangService.listKhachHangLienHe());
    }

    @PostMapping("/khach-hang/nhanh")
    public ResponseEntity<PosQuayKhachHangLienHeResponse> taoKhachNhanh(
            @Valid @RequestBody PosQuayKhachHangNhanhRequest request) {
        return ResponseEntity.ok(posQuayBanHangService.taoKhachHangNhanh(request));
    }

    @PostMapping("/hoa-don/{idHoaDon}/them-sach")
    public ResponseEntity<HoaDonDetailResponse> themSach(
            @PathVariable Integer idHoaDon,
            @Valid @RequestBody PosQuayThemSachRequest request) {
        return ResponseEntity.ok(posQuayBanHangService.themSachVaoHoaDon(idHoaDon, request));
    }

    @DeleteMapping("/hoa-don/{idHoaDon}/chi-tiet/{idChiTiet}")
    public ResponseEntity<HoaDonDetailResponse> xoaChiTiet(
            @PathVariable Integer idHoaDon,
            @PathVariable Integer idChiTiet) {
        return ResponseEntity.ok(posQuayBanHangService.xoaChiTietKhoiHoaDon(idHoaDon, idChiTiet));
    }

    @PostMapping("/hoa-don/{idHoaDon}/chi-tiet/{idChiTiet}/giam-so-luong")
    public ResponseEntity<HoaDonDetailResponse> giamSoLuongChiTiet(
            @PathVariable Integer idHoaDon,
            @PathVariable Integer idChiTiet,
            @Valid @RequestBody PosQuayGiamSoLuongRequest request) {
        return ResponseEntity.ok(posQuayBanHangService.giamSoLuongChiTiet(idHoaDon, idChiTiet, request));
    }

    @GetMapping("/san-pham/theo-ma-vach")
    public ResponseEntity<SachResponse> timSachTheoMaVach(@RequestParam String maVach) {
        return ResponseEntity.ok(posQuayBanHangService.timSachTheoMaVach(maVach));
    }

    @PostMapping("/hoa-don/{idHoaDon}/thanh-toan")
    public ResponseEntity<HoaDonDetailResponse> thanhToan(
            @PathVariable Integer idHoaDon,
            @RequestBody(required = false) PosQuayThanhToanRequest request) {
        PosQuayThanhToanRequest body = request != null ? request : new PosQuayThanhToanRequest();
        return ResponseEntity.ok(posQuayBanHangService.thanhToan(idHoaDon, body));
    }
}
