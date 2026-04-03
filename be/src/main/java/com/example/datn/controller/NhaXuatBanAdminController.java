package com.example.datn.controller;

import com.example.datn.dto.NhaXuatBanDTO;
import com.example.datn.dto.request.NhaXuatBanRequest;
import com.example.datn.entity.NhaXuatBan;
import com.example.datn.exception.AppException;
import com.example.datn.repository.NhaXuatBanRepository;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Comparator;

@RestController
@RequestMapping("/api/admin/v1/nha-xuat-ban")
@RequiredArgsConstructor
public class NhaXuatBanAdminController {

    private final NhaXuatBanRepository nhaXuatBanRepository;

    @GetMapping
    public ResponseEntity<List<NhaXuatBanDTO>> getAll() {
        List<NhaXuatBanDTO> res = nhaXuatBanRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(NhaXuatBan::getNgayCapNhat, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(item -> NhaXuatBanDTO.builder()
                        .id(item.getId())
                        .tenNxb(item.getTenNxb())
                        .diaChi(item.getDiaChi())
                        .soDienThoai(item.getSoDienThoai())
                        .ngayCapNhat(item.getNgayCapNhat())
                        .build())
                .toList();
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NhaXuatBanDTO> getById(@PathVariable Integer id) {
        NhaXuatBan entity = nhaXuatBanRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy NXB"));
        return ResponseEntity.ok(NhaXuatBanDTO.builder()
                .id(entity.getId())
                .tenNxb(entity.getTenNxb())
                .diaChi(entity.getDiaChi())
                .soDienThoai(entity.getSoDienThoai())
                .ngayCapNhat(entity.getNgayCapNhat())
                .build());
    }

    @PostMapping("/create")
    public ResponseEntity<NhaXuatBanDTO> create(@Valid @RequestBody NhaXuatBanRequest request) {
        NhaXuatBan entity = NhaXuatBan.builder()
                .tenNxb(request.getTenNxb())
                .diaChi(request.getDiaChi())
                .soDienThoai(request.getSoDienThoai())
                .ngayTao(LocalDateTime.now())
                .ngayCapNhat(LocalDateTime.now())
                .build();
        NhaXuatBan saved = nhaXuatBanRepository.save(entity);
        return new ResponseEntity<>(NhaXuatBanDTO.builder()
                .id(saved.getId())
                .tenNxb(saved.getTenNxb())
                .diaChi(saved.getDiaChi())
                .soDienThoai(saved.getSoDienThoai())
                .ngayCapNhat(saved.getNgayCapNhat())
                .build(), HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<NhaXuatBanDTO> update(@PathVariable Integer id, @Valid @RequestBody NhaXuatBanRequest request) {
        NhaXuatBan entity = nhaXuatBanRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy NXB"));
        entity.setTenNxb(request.getTenNxb());
        entity.setDiaChi(request.getDiaChi());
        entity.setSoDienThoai(request.getSoDienThoai());
        entity.setNgayCapNhat(LocalDateTime.now());
        NhaXuatBan saved = nhaXuatBanRepository.save(entity);
        return ResponseEntity.ok(NhaXuatBanDTO.builder()
                .id(saved.getId())
                .tenNxb(saved.getTenNxb())
                .diaChi(saved.getDiaChi())
                .soDienThoai(saved.getSoDienThoai())
                .ngayCapNhat(saved.getNgayCapNhat())
                .build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        if (!nhaXuatBanRepository.existsById(id)) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy NXB");
        }
        nhaXuatBanRepository.deleteById(id);
        return ResponseEntity.ok("Xóa NXB thành công");
    }
}

