package com.example.datn.service.impl;

import com.example.datn.dto.request.MaGiamGiaRequest;
import com.example.datn.dto.response.MaGiamGiaResponse;
import com.example.datn.entity.MaGiamGia;
import com.example.datn.exception.AppException;
import com.example.datn.repository.MaGiamGiaRepository;
import com.example.datn.service.MaGiamGiaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;

import com.example.datn.enums.VoucherStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaGiamGiaServiceImpl implements MaGiamGiaService {

    private final MaGiamGiaRepository maGiamGiaRepository;

    @Override
    public List<MaGiamGiaResponse> getAll() {
        return maGiamGiaRepository.findAllByOrderByNgayCapNhatDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MaGiamGiaResponse getById(Integer id) {
        MaGiamGia maGiamGia = maGiamGiaRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy mã giảm giá với ID: " + id));
        return mapToResponse(maGiamGia);
    }

    @Override
    public MaGiamGiaResponse create(MaGiamGiaRequest request) {
        if (maGiamGiaRepository.existsByTenMaGiamGia(request.getTenMaGiamGia())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Tên mã giảm giá đã tồn tại");
        }
        validateDates(request.getNgayBatDau(), request.getNgayKetThuc(), null);

        String generatedMaVoucher = "VC" + String.format("%05d", new Random().nextInt(100000));

        MaGiamGia maGiamGia = MaGiamGia.builder()
                .maVoucher(generatedMaVoucher)
                .tenMaGiamGia(request.getTenMaGiamGia())
                .giaTriGiam(request.getGiaTriGiam())
                .tienToiThieu(request.getTienToiThieu())
                .ngayBatDau(request.getNgayBatDau())
                .ngayKetThuc(request.getNgayKetThuc())
                .soLuong(request.getSoLuong())
                .trangThai(calculateStatus(request.getNgayBatDau(), request.getNgayKetThuc()))
                .build();
        
        MaGiamGia saved = maGiamGiaRepository.save(maGiamGia);
        return mapToResponse(saved);
    }

    @Override
    public MaGiamGiaResponse update(Integer id, MaGiamGiaRequest request) {
        if (maGiamGiaRepository.existsByTenMaGiamGiaAndIdNot(request.getTenMaGiamGia(), id)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Tên mã giảm giá đã tồn tại ở mã khác");
        }
        MaGiamGia maGiamGia = maGiamGiaRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy mã giảm giá với ID: " + id));

        validateDates(request.getNgayBatDau(), request.getNgayKetThuc(), maGiamGia.getNgayBatDau());

        maGiamGia.setTenMaGiamGia(request.getTenMaGiamGia());
        maGiamGia.setGiaTriGiam(request.getGiaTriGiam());
        maGiamGia.setTienToiThieu(request.getTienToiThieu());
        maGiamGia.setNgayBatDau(request.getNgayBatDau());
        maGiamGia.setNgayKetThuc(request.getNgayKetThuc());
        maGiamGia.setSoLuong(request.getSoLuong());
        maGiamGia.setTrangThai(calculateStatus(request.getNgayBatDau(), request.getNgayKetThuc()));

        MaGiamGia updated = maGiamGiaRepository.save(maGiamGia);
        return mapToResponse(updated);
    }

    @Override
    public List<MaGiamGiaResponse> search(String keyword) {
        return maGiamGiaRepository.searchByKeyword(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private VoucherStatus calculateStatus(LocalDateTime ngayBatDau, LocalDateTime ngayKetThuc) {
        LocalDateTime now = LocalDateTime.now();
        if (ngayKetThuc.isBefore(now)) {
            return VoucherStatus.NGUNG_HOAT_DONG;
        } else if (ngayBatDau.isAfter(now)) {
            return VoucherStatus.CHUA_KICH_HOAT;
        } else {
            return VoucherStatus.HOAT_DONG;
        }
    }

    @Scheduled(fixedRate = 60000)
    public void deactivateExpiredVouchers() {
        List<MaGiamGia> allVouchers = maGiamGiaRepository.findAll();
        boolean hasUpdate = false;
        
        for (MaGiamGia voucher : allVouchers) {
            VoucherStatus currentStatus = voucher.getTrangThai();
            VoucherStatus autoStatus = calculateStatus(voucher.getNgayBatDau(), voucher.getNgayKetThuc());
            
            if (currentStatus != autoStatus) {
                voucher.setTrangThai(autoStatus);
                hasUpdate = true;
            }
        }
        
        if (hasUpdate) {
            maGiamGiaRepository.saveAll(allVouchers);
        }
    }

    private void validateDates(LocalDateTime ngayBatDau, LocalDateTime ngayKetThuc, LocalDateTime existingNgayBatDau) {
        if (existingNgayBatDau == null || !ngayBatDau.isEqual(existingNgayBatDau)) {
            LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
            if (ngayBatDau.isBefore(now)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Ngày bắt đầu không được ở trong quá khứ");
            }
        }
        if (!ngayKetThuc.isAfter(ngayBatDau)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Ngày kết thúc phải sau ngày bắt đầu");
        }
    }

    private MaGiamGiaResponse mapToResponse(MaGiamGia entity) {
        return MaGiamGiaResponse.builder()
                .id(entity.getId())
                .maVoucher(entity.getMaVoucher())
                .tenMaGiamGia(entity.getTenMaGiamGia())
                .giaTriGiam(entity.getGiaTriGiam())
                .tienToiThieu(entity.getTienToiThieu())
                .ngayBatDau(entity.getNgayBatDau())
                .ngayKetThuc(entity.getNgayKetThuc())
                .soLuong(entity.getSoLuong())
                .trangThai(entity.getTrangThai())
                .ngayTao(entity.getNgayTao())
                .ngayCapNhat(entity.getNgayCapNhat())
                .build();
    }
}
