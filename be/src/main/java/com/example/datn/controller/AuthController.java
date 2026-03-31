//package com.example.datn.controller;
//import com.example.datn.dto.request.LoginRequest;
//import com.example.datn.dto.request.RegisterRequest;
//import com.example.datn.dto.response.AuthResponse;
//import com.example.datn.entity.TaiKhoan;
//import com.example.datn.repository.TaiKhoanRepository;
//import com.example.datn.security.JwtService;
//import com.example.datn.service.AuthService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/auth")
//@RequiredArgsConstructor
//public class AuthController {
//    private final TaiKhoanRepository taiKhoanRepository;
//    private final JwtService jwtService;
//    private final PasswordEncoder passwordEncoder;
//    private final AuthService authService;
//    @PostMapping("/register")
//    public AuthResponse register(@RequestBody RegisterRequest request) {
//        return authService.register(request);
//    }
//    @PostMapping("/login")
//    public AuthResponse login(@RequestBody LoginRequest request) {
//
//        TaiKhoan tk = taiKhoanRepository.findByTenDangNhap(request.getTenDangNhap())
//                .orElseThrow(() -> new RuntimeException("Sai tài khoản"));
//
//        if (!passwordEncoder.matches(request.getMatKhau(), tk.getMatKhau())) {
//            throw new RuntimeException("Sai mật khẩu");
//        }
//
//        String role = tk.getVaiTro().getTenVaiTro();
//
//        String token = jwtService.generateToken(tk.getTenDangNhap(), role);
//
//        return AuthResponse.builder()
//                .token(token)
//                .username(tk.getTenDangNhap())
//                .role(role)
//                .build();
//    }
//}
