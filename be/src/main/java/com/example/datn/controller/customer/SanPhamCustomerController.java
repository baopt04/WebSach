package com.example.datn.controller.customer;

import com.example.datn.dto.response.client.ClientNhaXuatBanResponse;
import com.example.datn.dto.response.client.ClientSanPhamResponse;
import com.example.datn.dto.response.client.ClientTheLoaiResponse;
import com.example.datn.service.CustomerSanPhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/v1/san-pham")
@RequiredArgsConstructor
public class SanPhamCustomerController {

    private final CustomerSanPhamService clientSanPhamService;

    @GetMapping
    public ResponseEntity<List<ClientSanPhamResponse>> getAllSanPham() {
        return ResponseEntity.ok(clientSanPhamService.getAllSanPham());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ClientSanPhamResponse>> searchSanPhamByTen(@RequestParam("keyword") String keyword) {
        return ResponseEntity.ok(clientSanPhamService.searchSanPhamByTen(keyword));
    }

    @GetMapping("/ban-chay")
    public ResponseEntity<List<ClientSanPhamResponse>> getSanPhamBanChay() {
        return ResponseEntity.ok(clientSanPhamService.getSanPhamBanChay());
    }

    @GetMapping("/moi-nhat")
    public ResponseEntity<List<ClientSanPhamResponse>> getSanPhamMoiNhat() {
        return ResponseEntity.ok(clientSanPhamService.getSanPhamMoiNhat());
    }

    @GetMapping("/chi-tiet/{id}")
    public ResponseEntity<?> getChiTietSach(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(clientSanPhamService.getChiTietSach(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/kiem-tra-so-luong")
    public ResponseEntity<?> validateQuantity(@RequestParam("id") Integer id, @RequestParam Integer quantity) {
        try {
            clientSanPhamService.validateQuantity(id, quantity);
            return ResponseEntity.ok("Số lượng hợp lệ");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/the-loai")
    public ResponseEntity<List<ClientTheLoaiResponse>> getAllTheLoai() {
        return ResponseEntity.ok(clientSanPhamService.getAllTheLoai());
    }

    @GetMapping("/the-loai/{idTheLoai}")
    public ResponseEntity<List<ClientSanPhamResponse>> getSanPhamByTheLoai(@PathVariable Integer idTheLoai) {
        return ResponseEntity.ok(clientSanPhamService.getSanPhamByTheLoai(idTheLoai));
    }

    @GetMapping("/nha-xuat-ban")
    public ResponseEntity<List<ClientNhaXuatBanResponse>> getAllNhaXuatBan() {
        return ResponseEntity.ok(clientSanPhamService.getAllNhaXuatBan());
    }

    @GetMapping("/nha-xuat-ban/{idNhaXuatBan}")
    public ResponseEntity<List<ClientSanPhamResponse>> getSanPhamByNhaXuatBan(@PathVariable Integer idNhaXuatBan) {
        return ResponseEntity.ok(clientSanPhamService.getSanPhamByNhaXuatBan(idNhaXuatBan));
    }
}
