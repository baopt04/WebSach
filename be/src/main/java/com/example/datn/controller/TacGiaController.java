package com.example.datn.controller;

import com.example.datn.dto.TacGiaDTO;
import com.example.datn.repository.TacGiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tac-gia")
@RequiredArgsConstructor
@CrossOrigin("*")

public class TacGiaController {
    private final TacGiaRepository tacGiaRepository;

    @GetMapping
    public List<TacGiaDTO> getAll() {
        return tacGiaRepository.findAll()
                .stream()
                .map(item -> TacGiaDTO.builder()
                        .id(item.getId())
                        .tenTacGia(item.getTenTacGia())
                        .tieuSu(item.getTieuSu())
                        .build())
                .toList();
    }
}
