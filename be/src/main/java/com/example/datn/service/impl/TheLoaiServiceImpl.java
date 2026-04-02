package com.example.datn.service.impl;

import com.example.datn.dto.TheLoaiDTO;
import com.example.datn.repository.TheLoaiRepository;
import com.example.datn.service.TheLoaiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TheLoaiServiceImpl implements TheLoaiService {

    private final TheLoaiRepository theLoaiRepository;

    @Override
    public List<TheLoaiDTO> getAll() {
        return theLoaiRepository.findAll()
                .stream()
                .map(item -> TheLoaiDTO.builder()
                        .id(item.getId())
                        .tenTheLoai(item.getTenTheLoai())
                        .build())
                .toList();
    }
}
