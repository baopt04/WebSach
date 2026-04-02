package com.example.datn.controller;


import com.example.datn.dto.NhaXuatBanDTO;
import com.example.datn.repository.NhaXuatBanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nha-xuat-ban")
@RequiredArgsConstructor
@CrossOrigin("*")
public class NhaXuatBanController {
    private final NhaXuatBanRepository nhaXuatBanRepository;

    @GetMapping
    public List<NhaXuatBanDTO> getAll() {
        return nhaXuatBanRepository.findAll()
                .stream()
                .map(item -> NhaXuatBanDTO.builder()
                        .id(item.getId())
                        .tenNxb(item.getTenNxb())
                        .diaChi(item.getDiaChi())
                        .soDienThoai(item.getSoDienThoai())
                        .build())
                .toList();
    }
}
