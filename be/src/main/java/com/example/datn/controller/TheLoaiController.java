package com.example.datn.controller;
import com.example.datn.dto.TheLoaiDTO;
import com.example.datn.service.TheLoaiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/the-loai")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TheLoaiController {
    private final TheLoaiService theLoaiService;

    @GetMapping
    public List<TheLoaiDTO> getAll() {
        return theLoaiService.getAll();
    }
}
