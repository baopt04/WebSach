
package com.example.datn.controller;

import com.example.datn.dto.request.LoginRequest;
import com.example.datn.dto.request.RegisterRequest;
import com.example.datn.dto.response.AuthResponse;
import com.example.datn.entity.TaiKhoan;
import com.example.datn.enums.AccountStatus;
import com.example.datn.enums.Role;
import com.example.datn.repository.TaiKhoanRepository;
import com.example.datn.security.JwtService;
import com.example.datn.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final TaiKhoanRepository taiKhoanRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final Random random = new Random();
    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();


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

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        String hoTen = request.getHoTen() != null ? request.getHoTen().trim() : "";
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        String soDienThoai = request.getSoDienThoai() != null ? request.getSoDienThoai().trim() : "";

        if (hoTen.isBlank()) {
            return ResponseEntity.badRequest().body("Họ tên không được để trống");
        }
        if (email.isBlank()) {
            return ResponseEntity.badRequest().body("Email không được để trống");
        }
        if (taiKhoanRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email đã tồn tại");
        }
        if (soDienThoai.isBlank()) {
            return ResponseEntity.badRequest().body("Số điện thoại không được để trống");
        }
        if (!soDienThoai.matches("^0\\d{9}$")) {
            return ResponseEntity.badRequest().body("Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số");
        }
        if (taiKhoanRepository.existsBySoDienThoai(soDienThoai)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Số điện thoại đã tồn tại");
        }

        String rawPassword = generateRandomPassword(10);
        LocalDateTime now = LocalDateTime.now();
        String maTaiKhoan = "TK" + String.format("%05d", random.nextInt(100000));

        TaiKhoan taiKhoan = TaiKhoan.builder()
                .maTaiKhoan(maTaiKhoan)
                .email(email)
                .matKhau(passwordEncoder.encode(rawPassword))
                .hoTen(hoTen)
                .soDienThoai(soDienThoai)
                .vaiTro(Role.ROLE_CUSTOMER)
                .trangThai(AccountStatus.ACTIVATED)
                .ngayTao(now)
                .ngayCapNhat(now)
                .build();
        taiKhoanRepository.save(taiKhoan);

        sendRegisterPasswordEmail(email, hoTen, rawPassword);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Đăng ký thành công. Mật khẩu đã được gửi về email của bạn."));
    }

    private void sendRegisterPasswordEmail(String email, String hoTen, String rawPassword) {
        String html = """
                <div style="font-family:Arial,sans-serif;line-height:1.6">
                    <h2>Chào mừng bạn đến với cửa hàng DREAM BOOK</h2>
                    <p>Xin chào <strong>%s</strong>,</p>
                    <p>Tài khoản của bạn đã được tạo thành công với tài khoản đăng nhập là email của bạn.</p>
                    <p>Mật khẩu tạm thời của bạn là:</p>
                    <p style="font-size:20px;font-weight:bold;color:#1677ff">%s</p>
                    <p>Vui lòng đăng nhập và đổi mật khẩu để bảo vệ tài khoản của bạn.</p>
                </div>
                """.formatted(hoTen, rawPassword);
        emailService.sendHtmlEmail(email, "Đăng ký tài khoản cửa hàng bán sách DREAM BOOK thành công", html);
    }

    private String generateRandomPassword(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int idx = SECURE_RANDOM.nextInt(PASSWORD_CHARS.length());
            sb.append(PASSWORD_CHARS.charAt(idx));
        }
        return sb.toString();
    }
}

