package com.example.datn.controller;

import com.example.datn.dto.request.MaGiamGiaRequest;
import com.example.datn.dto.response.MaGiamGiaResponse;
import com.example.datn.service.MaGiamGiaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController

@RequestMapping("/api/admin/v1/ma-giam-gia")

@RequiredArgsConstructor
public class MaGiamGiaController {

    private final MaGiamGiaService maGiamGiaService;

    @GetMapping
    public ResponseEntity<List<MaGiamGiaResponse>> getAll() {
        return ResponseEntity.ok(maGiamGiaService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaGiamGiaResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(maGiamGiaService.getById(id));
    }

    @PostMapping("/create")
    public ResponseEntity<MaGiamGiaResponse> create(@Valid @RequestBody MaGiamGiaRequest request) {
        return new ResponseEntity<>(maGiamGiaService.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<MaGiamGiaResponse> update(@PathVariable Integer id, 
                                                    @Valid @RequestBody MaGiamGiaRequest request) {
        return ResponseEntity.ok(maGiamGiaService.update(id, request));
    }

    @GetMapping("/search")
    public ResponseEntity<List<MaGiamGiaResponse>> search(@RequestParam("keyword") String keyword) {
        return ResponseEntity.ok(maGiamGiaService.search(keyword));
    }
}
