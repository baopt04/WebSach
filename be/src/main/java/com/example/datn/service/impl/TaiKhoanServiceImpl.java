package com.example.datn.service.impl;

import com.example.datn.dto.request.TaiKhoanRequest;
import com.example.datn.dto.response.TaiKhoanResponse;
import com.example.datn.dto.response.TaiKhoanSummaryResponse;
import com.example.datn.entity.TaiKhoan;
import com.example.datn.exception.AppException;
import com.example.datn.repository.TaiKhoanRepository;
import com.example.datn.service.EmailService;
import com.example.datn.service.TaiKhoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaiKhoanServiceImpl implements TaiKhoanService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<TaiKhoanSummaryResponse> getAll() {
        return taiKhoanRepository.findAllByOrderByNgayCapNhatDesc().stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TaiKhoanResponse getById(Integer id) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản với ID: " + id));
        return mapToResponse(taiKhoan);
    }

    @Override
    public TaiKhoanResponse create(TaiKhoanRequest request) {
        if (taiKhoanRepository.existsByEmail(request.getEmail())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Email đã được sử dụng");
        }
        if (taiKhoanRepository.existsBySoDienThoai(request.getSoDienThoai())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Số điện thoại đã được sử dụng");
        }

        validateAge(request.getNgaySinh());

        String generatedMaTaiKhoan = "TK" + String.format("%05d", new Random().nextInt(100000));
        String generatedPassword = generateRandomPassword(8);

        TaiKhoan taiKhoan = TaiKhoan.builder()
                .maTaiKhoan(generatedMaTaiKhoan)
                .email(request.getEmail())
                .matKhau(passwordEncoder.encode(generatedPassword)) // Lưu mật khẩu đã BCrypt
                .hoTen(request.getHoTen())
                .soDienThoai(request.getSoDienThoai())
                .vaiTro(request.getVaiTro())
                .trangThai(request.getTrangThai())
                .ngaySinh(request.getNgaySinh())
                .gioiTinh(request.getGioiTinh())
                .ngayTao(LocalDateTime.now())
                .ngayCapNhat(LocalDateTime.now())
                .build();

        TaiKhoan saved = taiKhoanRepository.save(taiKhoan);
        

        String subject = "Thông báo tạo tài khoản thành công tại website ekumi fukuda";
        String content = "Chào " + saved.getHoTen() + ",<br/>"
                + "Tài khoản của bạn đã được tạo thành công.<br/>"
                + "Mã tài khoản: <b>" + saved.getEmail() + "</b><br/>"
                + "Mật khẩu đăng nhập: <b>" + generatedPassword + "</b><br/>"
                + "Vui lòng đổi mật khẩu sau khi đăng nhập."
                + "Xin chân thành cảm ơn!";
        emailService.sendHtmlEmail(saved.getEmail(), subject, content);

        return mapToResponse(saved);
    }

    @Override
    public TaiKhoanResponse update(Integer id, TaiKhoanRequest request) {
        if (!taiKhoanRepository.existsById(id)) {
             throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản với ID: " + id);
        }
        
        if (taiKhoanRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Email đã tồn tại ở tài khoản khác");
        }
        if (taiKhoanRepository.existsBySoDienThoaiAndIdNot(request.getSoDienThoai(), id)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Số điện thoại đã tồn tại ở tài khoản khác");
        }

        validateAge(request.getNgaySinh());

        TaiKhoan taiKhoan = taiKhoanRepository.findById(id).get();

        taiKhoan.setEmail(request.getEmail());
        taiKhoan.setHoTen(request.getHoTen());
        taiKhoan.setSoDienThoai(request.getSoDienThoai());
        taiKhoan.setVaiTro(request.getVaiTro());
        taiKhoan.setTrangThai(request.getTrangThai());
        taiKhoan.setNgaySinh(request.getNgaySinh());
        taiKhoan.setGioiTinh(request.getGioiTinh());
        taiKhoan.setNgayCapNhat(LocalDateTime.now());

        TaiKhoan updated = taiKhoanRepository.save(taiKhoan);
        return mapToResponse(updated);
    }

    @Override
    public List<TaiKhoanSummaryResponse> search(String keyword) {
        return taiKhoanRepository.searchByKeyword(keyword).stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Integer id) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản với ID: " + id));
        taiKhoanRepository.delete(taiKhoan);
    }

    private void validateAge(LocalDate ngaySinh) {
        if (ngaySinh == null) return;
        int age = Period.between(ngaySinh, LocalDate.now()).getYears();
        if (age < 18) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Khách hàng phải từ đủ 18 tuổi trở lên");
        }
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private TaiKhoanResponse mapToResponse(TaiKhoan entity) {
        return TaiKhoanResponse.builder()
                .id(entity.getId())
                .maTaiKhoan(entity.getMaTaiKhoan())
                .email(entity.getEmail())
                .hoTen(entity.getHoTen())
                .soDienThoai(entity.getSoDienThoai())
                .vaiTro(entity.getVaiTro())
                .trangThai(entity.getTrangThai())
                .ngaySinh(entity.getNgaySinh())
                .gioiTinh(entity.getGioiTinh())
                .ngayTao(entity.getNgayTao())
                .ngayCapNhat(entity.getNgayCapNhat())
                .build();
    }
    
    private TaiKhoanSummaryResponse mapToSummaryResponse(TaiKhoan entity) {
        return TaiKhoanSummaryResponse.builder()
                .id(entity.getId())
                .maTaiKhoan(entity.getMaTaiKhoan())
                .hoTen(entity.getHoTen())
                .email(entity.getEmail())
                .soDienThoai(entity.getSoDienThoai())
                .ngaySinh(entity.getNgaySinh())
                .vaiTro(entity.getVaiTro())
                .trangThai(entity.getTrangThai())
                .build();
    }
}

