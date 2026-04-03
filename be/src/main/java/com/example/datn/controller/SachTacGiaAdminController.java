package com.example.datn.controller;

import com.example.datn.dto.SachTacGiaDTO;
import com.example.datn.dto.request.SachTacGiaCreateRequest;
import com.example.datn.dto.request.SachTacGiaUpdateRequest;
import com.example.datn.entity.Sach;
import com.example.datn.entity.SachTacGia;
import com.example.datn.entity.SachTacGiaId;
import com.example.datn.entity.TacGia;
import com.example.datn.exception.AppException;
import com.example.datn.repository.SachRepository;
import com.example.datn.repository.SachTacGiaRepository;
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
@RequestMapping("/api/admin/v1/sach-tac-gia")
@RequiredArgsConstructor
public class SachTacGiaAdminController {

    private final SachTacGiaRepository sachTacGiaRepository;
    private final SachRepository sachRepository;
    private final TacGiaRepository tacGiaRepository;

    @GetMapping("/sach/{idSach}")
    public ResponseEntity<List<SachTacGiaDTO>> getBySachId(@PathVariable Integer idSach) {
        List<SachTacGia> list = sachTacGiaRepository.findBySach_Id(idSach);
        List<SachTacGiaDTO> res = list.stream()
                .sorted(Comparator.comparing(SachTacGia::getNgayCapNhat, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::mapToDto)
                .toList();
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{idSach}/{idTacGia}")
    public ResponseEntity<SachTacGiaDTO> getDetail(
            @PathVariable Integer idSach,
            @PathVariable Integer idTacGia
    ) {
        SachTacGia entity = findMappingOrThrow(idSach, idTacGia);
        return ResponseEntity.ok(mapToDto(entity));
    }

    @PostMapping("/create")
    public ResponseEntity<SachTacGiaDTO> create(@Valid @RequestBody SachTacGiaCreateRequest request) {
        Sach sach = sachRepository.findById(request.getIdSach())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy sách"));
        TacGia tacGia = tacGiaRepository.findById(request.getIdTacGia())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tác giả"));
        boolean existed = sachTacGiaRepository.findBySach_Id(request.getIdSach())
                .stream()
                .anyMatch(m -> m.getId() != null && m.getId().getIdTacGia().equals(request.getIdTacGia()));
        if (existed) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Sách đã có tác giả này");
        }

        SachTacGia saved = sachTacGiaRepository.save(SachTacGia.builder()
                .id(new SachTacGiaId(request.getIdSach(), request.getIdTacGia()))
                .sach(sach)
                .tacGia(tacGia)
                .vaiTro(request.getVaiTro())
                .ngayTao(LocalDateTime.now())
                .ngayCapNhat(LocalDateTime.now())
                .build());

        return new ResponseEntity<>(mapToDto(saved), HttpStatus.CREATED);
    }

    @PutMapping("/update/{idSach}/{idTacGia}")
    public ResponseEntity<SachTacGiaDTO> update(
            @PathVariable Integer idSach,
            @PathVariable Integer idTacGia,
            @Valid @RequestBody SachTacGiaUpdateRequest request
    ) {
        SachTacGia entity = findMappingOrThrow(idSach, idTacGia);
        entity.setVaiTro(request.getVaiTro());
        entity.setNgayCapNhat(LocalDateTime.now());
        SachTacGia saved = sachTacGiaRepository.save(entity);
        return ResponseEntity.ok(mapToDto(saved));
    }

    @DeleteMapping("/delete/{idSach}/{idTacGia}")
    public ResponseEntity<String> delete(
            @PathVariable Integer idSach,
            @PathVariable Integer idTacGia
    ) {
        SachTacGia entity = findMappingOrThrow(idSach, idTacGia);
        sachTacGiaRepository.delete(entity);
        return ResponseEntity.ok("Xóa sách-tác giả thành công");
    }

    private SachTacGia findMappingOrThrow(Integer idSach, Integer idTacGia) {
        List<SachTacGia> list = sachTacGiaRepository.findBySach_Id(idSach);
        return list.stream()
                .filter(m -> m.getId() != null && m.getId().getIdTacGia().equals(idTacGia))
                .findFirst()
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy sách-tác giả"));
    }

    private SachTacGiaDTO mapToDto(SachTacGia entity) {
        if (entity == null) return null;
        Integer idSach = entity.getId() != null ? entity.getId().getIdSach() : null;
        Integer idTacGia = entity.getId() != null ? entity.getId().getIdTacGia() : null;
        return SachTacGiaDTO.builder()
                .idSach(idSach)
                .idTacGia(idTacGia)
                .tenTacGia(entity.getTacGia() != null ? entity.getTacGia().getTenTacGia() : null)
                .vaiTro(entity.getVaiTro())
                .ngayCapNhat(entity.getNgayCapNhat())
                .build();
    }
}

