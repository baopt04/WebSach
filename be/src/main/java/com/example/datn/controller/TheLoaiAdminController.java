package com.example.datn.controller;

import com.example.datn.dto.TheLoaiDTO;
import com.example.datn.dto.request.TheLoaiRequest;
import com.example.datn.entity.TheLoai;
import com.example.datn.exception.AppException;
import com.example.datn.repository.TheLoaiRepository;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Comparator;

@RestController
@RequestMapping("/api/admin/v1/the-loai")
@RequiredArgsConstructor
public class TheLoaiAdminController {

    private final TheLoaiRepository theLoaiRepository;

    @GetMapping
    public ResponseEntity<List<TheLoaiDTO>> getAll() {
        List<TheLoaiDTO> res = theLoaiRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(TheLoai::getNgayCapNhat, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(item -> TheLoaiDTO.builder()
                        .id(item.getId())
                        .tenTheLoai(item.getTenTheLoai())
                        .ngayCapNhat(item.getNgayCapNhat())
                        .build())
                .toList();
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TheLoaiDTO> getById(@PathVariable Integer id) {
        TheLoai entity = theLoaiRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thể loại"));
        return ResponseEntity.ok(TheLoaiDTO.builder()
                .id(entity.getId())
                .tenTheLoai(entity.getTenTheLoai())
                .ngayCapNhat(entity.getNgayCapNhat())
                .build());
    }

    @PostMapping("/create")
    public ResponseEntity<TheLoaiDTO> create(@Valid @RequestBody TheLoaiRequest request) {
        TheLoai entity = TheLoai.builder()
                .tenTheLoai(request.getTenTheLoai())
                .ngayTao(LocalDateTime.now())
                .ngayCapNhat(LocalDateTime.now())
                .build();
        TheLoai saved = theLoaiRepository.save(entity);
        return new ResponseEntity<>(TheLoaiDTO.builder()
                .id(saved.getId())
                .tenTheLoai(saved.getTenTheLoai())
                .ngayCapNhat(saved.getNgayCapNhat())
                .build(), HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<TheLoaiDTO> update(@PathVariable Integer id, @Valid @RequestBody TheLoaiRequest request) {
        TheLoai entity = theLoaiRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thể loại"));
        entity.setTenTheLoai(request.getTenTheLoai());
        entity.setNgayCapNhat(LocalDateTime.now());
        TheLoai saved = theLoaiRepository.save(entity);
        return ResponseEntity.ok(TheLoaiDTO.builder()
                .id(saved.getId())
                .tenTheLoai(saved.getTenTheLoai())
                .ngayCapNhat(saved.getNgayCapNhat())
                .build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        if (!theLoaiRepository.existsById(id)) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thể loại");
        }
        theLoaiRepository.deleteById(id);
        return ResponseEntity.ok("Xóa thể loại thành công");
    }
}

