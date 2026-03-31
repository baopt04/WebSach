package com.example.datn.controller;


import com.example.datn.dto.request.SachRequest;
import com.example.datn.dto.response.SachResponse;
import com.example.datn.service.SachService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sach")
@RequiredArgsConstructor
public class SachController {

    private final SachService sachService;

    @GetMapping
    public List<SachResponse> getAll() {
        return sachService.getAll();
    }

    @PostMapping
    public SachResponse add(@Valid @RequestBody SachRequest request) {
        return sachService.add(request);
    }
    @GetMapping("/{id}")
    public SachResponse detail(@PathVariable Integer id) {
        return sachService.detail(id);
    }

    @PutMapping("/{id}")
    public SachResponse update(@PathVariable Integer id,
                               @Valid @RequestBody SachRequest request) {
        return sachService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String hidden(@PathVariable Integer id) {
        sachService.hidden(id);
        return "Ẩn sách thành công";
    }
    @GetMapping("/search")
    public List<SachResponse> search(@RequestParam String keyword) {
        return sachService.search(keyword);
    }

    @GetMapping("/the-loai/{idTheLoai}")
    public List<SachResponse> findByTheLoai(@PathVariable Integer idTheLoai) {
        return sachService.findByTheLoai(idTheLoai);
    }

}
