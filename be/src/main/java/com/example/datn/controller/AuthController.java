package com.example.datn.controller;

import com.example.datn.dto.request.LoginRequest;
import com.example.datn.dto.response.AuthResponse;
import com.example.datn.entity.TaiKhoan;
import com.example.datn.enums.AccountStatus;
import com.example.datn.repository.TaiKhoanRepository;
import com.example.datn.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final TaiKhoanRepository taiKhoanRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        TaiKhoan tk = taiKhoanRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));
        if (!passwordEncoder.matches(request.getMatKhau(), tk.getMatKhau())) {
            return ResponseEntity.status(401).body("Mật khẩu không đúng");
        }
        if (tk.getTrangThai() != AccountStatus.ACTIVATED) {
            return ResponseEntity.status(403).body("Tài khoản đã bị khóa");
        }
        String role = tk.getVaiTro().name();
        String token = jwtService.generateToken(tk.getEmail(), role);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .email(tk.getEmail())
                .hoTen(tk.getHoTen())
                        .soDienThoai(tk.getSoDienThoai())
                        .gioiTinh(tk.getGioiTinh())
                        .ngaySinh(tk.getNgaySinh())
                .role(role)
                .build());
    }
}
