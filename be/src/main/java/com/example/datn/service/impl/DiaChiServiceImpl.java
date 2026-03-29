package com.example.datn.service.impl;

import com.example.datn.dto.request.DiaChiRequest;
import com.example.datn.dto.response.DiaChiResponse;
import com.example.datn.entity.DiaChi;
import com.example.datn.entity.TaiKhoan;
import com.example.datn.exception.AppException;
import com.example.datn.repository.DiaChiRepository;
import com.example.datn.repository.TaiKhoanRepository;
import com.example.datn.service.DiaChiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiaChiServiceImpl implements DiaChiService {

    private final DiaChiRepository diaChiRepository;
    private final TaiKhoanRepository taiKhoanRepository;

    @Override
    public List<DiaChiResponse> getAll() {
        return diaChiRepository.findAllByOrderByNgayCapNhatDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DiaChiResponse> getByTaiKhoanId(Integer idTaiKhoan) {
        return diaChiRepository.findByTaiKhoanIdOrderByNgayCapNhatDesc(idTaiKhoan).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DiaChiResponse create(DiaChiRequest request) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(request.getIdTaiKhoan())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));

        DiaChi diaChi = DiaChi.builder()
                .taiKhoan(taiKhoan)
                .hoTen(request.getHoTen())
                .soDienThoai(request.getSoDienThoai())
                .idTinhThanh(request.getIdTinhThanh())
                .tinhThanh(request.getTinhThanh())
                .idQuanHuyen(request.getIdQuanHuyen())
                .quanHuyen(request.getQuanHuyen())
                .idPhuongXa(request.getIdPhuongXa())
                .phuongXa(request.getPhuongXa())
                .diaChiChiTiet(request.getDiaChiChiTiet())
                .macDinh(false)
                .ngayTao(LocalDateTime.now())
                .ngayCapNhat(LocalDateTime.now())
                .build();

        DiaChi saved = diaChiRepository.save(diaChi);
        return mapToResponse(saved);
    }

    @Override
    public DiaChiResponse update(Integer id, DiaChiRequest request) {
        DiaChi diaChi = diaChiRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ với ID: " + id));

        TaiKhoan taiKhoan = taiKhoanRepository.findById(request.getIdTaiKhoan())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));

        diaChi.setTaiKhoan(taiKhoan);
        diaChi.setHoTen(request.getHoTen());
        diaChi.setSoDienThoai(request.getSoDienThoai());
        diaChi.setIdTinhThanh(request.getIdTinhThanh());
        diaChi.setTinhThanh(request.getTinhThanh());
        diaChi.setIdQuanHuyen(request.getIdQuanHuyen());
        diaChi.setQuanHuyen(request.getQuanHuyen());
        diaChi.setIdPhuongXa(request.getIdPhuongXa());
        diaChi.setPhuongXa(request.getPhuongXa());
        diaChi.setDiaChiChiTiet(request.getDiaChiChiTiet());
        diaChi.setNgayCapNhat(LocalDateTime.now());

        DiaChi updated = diaChiRepository.save(diaChi);
        return mapToResponse(updated);
    }

    @Override
    public void delete(Integer id) {
        DiaChi diaChi = diaChiRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ với ID: " + id));
        
        if (diaChi.getMacDinh() != null && diaChi.getMacDinh()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không được xóa địa chỉ mặc định");
        }
        
        diaChiRepository.delete(diaChi);
    }

    @Override
    public void setDefault(Integer id) {
        DiaChi diaChi = diaChiRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ với ID: " + id));

        List<DiaChi> list = diaChiRepository.findByTaiKhoanIdOrderByNgayCapNhatDesc(diaChi.getTaiKhoan().getId());

        for (DiaChi d : list) {
            d.setMacDinh(false);
            d.setNgayCapNhat(LocalDateTime.now());
        }

        diaChi.setMacDinh(true);
        diaChi.setNgayCapNhat(LocalDateTime.now());

        diaChiRepository.saveAll(list);
    }

    private DiaChiResponse mapToResponse(DiaChi entity) {
        return DiaChiResponse.builder()
                .id(entity.getId())
                .idTaiKhoan(entity.getTaiKhoan() != null ? entity.getTaiKhoan().getId() : null)
                .hoTen(entity.getHoTen())
                .soDienThoai(entity.getSoDienThoai())
                .emailTaiKhoan(entity.getTaiKhoan() != null ? entity.getTaiKhoan().getEmail() : null)
                .idTinhThanh(entity.getIdTinhThanh())
                .tinhThanh(entity.getTinhThanh())
                .idQuanHuyen(entity.getIdQuanHuyen())
                .quanHuyen(entity.getQuanHuyen())
                .idPhuongXa(entity.getIdPhuongXa())
                .phuongXa(entity.getPhuongXa())
                .diaChiChiTiet(entity.getDiaChiChiTiet())
                .macDinh(entity.getMacDinh())
                .ngayTao(entity.getNgayTao())
                .ngayCapNhat(entity.getNgayCapNhat())
                .build();
    }
}
