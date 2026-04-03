package com.example.datn.controller;

import com.example.datn.dto.TacGiaDTO;
import com.example.datn.dto.request.TacGiaRequest;
import com.example.datn.entity.TacGia;
import com.example.datn.exception.AppException;
import com.example.datn.repository.TacGiaRepository;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Comparator;

@RestController
@RequestMapping("/api/admin/v1/tac-gia")
@RequiredArgsConstructor
public class TacGiaAdminController {

    private final TacGiaRepository tacGiaRepository;

    @GetMapping
    public ResponseEntity<List<TacGiaDTO>> getAll() {
        List<TacGiaDTO> res = tacGiaRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(TacGia::getNgayCapNhat, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(item -> TacGiaDTO.builder()
                        .id(item.getId())
                        .tenTacGia(item.getTenTacGia())
                        .tieuSu(item.getTieuSu())
                        .ngayCapNhat(item.getNgayCapNhat())
                        .build())
                .toList();
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TacGiaDTO> getById(@PathVariable Integer id) {
        TacGia entity = tacGiaRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tác giả"));
        return ResponseEntity.ok(TacGiaDTO.builder()
                .id(entity.getId())
                .tenTacGia(entity.getTenTacGia())
                .tieuSu(entity.getTieuSu())
                .ngayCapNhat(entity.getNgayCapNhat())
                .build());
    }

    @PostMapping("/create")
    public ResponseEntity<TacGiaDTO> create(@Valid @RequestBody TacGiaRequest request) {
        TacGia entity = TacGia.builder()
                .tenTacGia(request.getTenTacGia())
                .tieuSu(request.getTieuSu())
                .ngayTao(LocalDateTime.now())
                .ngayCapNhat(LocalDateTime.now())
                .build();
        TacGia saved = tacGiaRepository.save(entity);
        return new ResponseEntity<>(TacGiaDTO.builder()
                .id(saved.getId())
                .tenTacGia(saved.getTenTacGia())
                .tieuSu(saved.getTieuSu())
                .ngayCapNhat(saved.getNgayCapNhat())
                .build(), HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<TacGiaDTO> update(@PathVariable Integer id, @Valid @RequestBody TacGiaRequest request) {
        TacGia entity = tacGiaRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tác giả"));
        entity.setTenTacGia(request.getTenTacGia());
        entity.setTieuSu(request.getTieuSu());
        entity.setNgayCapNhat(LocalDateTime.now());
        TacGia saved = tacGiaRepository.save(entity);
        return ResponseEntity.ok(TacGiaDTO.builder()
                .id(saved.getId())
                .tenTacGia(saved.getTenTacGia())
                .tieuSu(saved.getTieuSu())
                .ngayCapNhat(saved.getNgayCapNhat())
                .build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        if (!tacGiaRepository.existsById(id)) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tác giả");
        }
        tacGiaRepository.deleteById(id);
        return ResponseEntity.ok("Xóa tác giả thành công");
    }
}

