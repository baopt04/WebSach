
package com.example.datn.controller;

import com.example.datn.dto.request.TaiKhoanRequest;
import com.example.datn.dto.response.TaiKhoanResponse;
import com.example.datn.dto.response.TaiKhoanSummaryResponse;
import com.example.datn.service.TaiKhoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/v1/tai-khoan")
@RequiredArgsConstructor
public class TaiKhoanController {
    
    private final TaiKhoanService taiKhoanService;

    @GetMapping
    public ResponseEntity<List<TaiKhoanSummaryResponse>> getAll() {
        return ResponseEntity.ok(taiKhoanService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaiKhoanResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(taiKhoanService.getById(id));
    }

    @PostMapping("/create")
    public ResponseEntity<TaiKhoanResponse> create(@Valid @RequestBody TaiKhoanRequest request) {
        return new ResponseEntity<>(taiKhoanService.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<TaiKhoanResponse> update(@PathVariable Integer id,
                                                   @Valid @RequestBody TaiKhoanRequest request) {
        return ResponseEntity.ok(taiKhoanService.update(id, request));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        taiKhoanService.delete(id);
        return ResponseEntity.ok("Xóa thành công tài khoản!");
    }

    @GetMapping("/search")
    public ResponseEntity<List<TaiKhoanSummaryResponse>> search(@RequestParam("keyword") String keyword) {
        return ResponseEntity.ok(taiKhoanService.search(keyword));
    }
}

