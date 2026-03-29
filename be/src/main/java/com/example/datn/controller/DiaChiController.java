package com.example.datn.controller;

import com.example.datn.dto.request.DiaChiRequest;
import com.example.datn.dto.response.DiaChiResponse;
import com.example.datn.service.DiaChiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/v1/dia-chi")
@RequiredArgsConstructor
public class DiaChiController {

    private final DiaChiService diaChiService;

    @GetMapping
    public ResponseEntity<List<DiaChiResponse>> getAll() {
        return ResponseEntity.ok(diaChiService.getAll());
    }

    @GetMapping("/tai-khoan/{idTaiKhoan}")
    public ResponseEntity<List<DiaChiResponse>> getByTaiKhoanId(@PathVariable("idTaiKhoan") Integer idTaiKhoan) {
        return ResponseEntity.ok(diaChiService.getByTaiKhoanId(idTaiKhoan));
    }

    @PostMapping("/create")
    public ResponseEntity<DiaChiResponse> create(@Valid @RequestBody DiaChiRequest request) {
        return new ResponseEntity<>(diaChiService.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<DiaChiResponse> update(@PathVariable Integer id,
                                                 @Valid @RequestBody DiaChiRequest request) {
        return ResponseEntity.ok(diaChiService.update(id, request));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable("id") Integer id) {
        diaChiService.delete(id);
        return ResponseEntity.ok("Xóa thành công địa chỉ!");
    }

    @PutMapping("/{id}/set-default")
    public ResponseEntity<String> setDefault(@PathVariable("id") Integer id) {
        diaChiService.setDefault(id);
        return ResponseEntity.ok("Đặt địa chỉ mặc định thành công!");
    }
}
