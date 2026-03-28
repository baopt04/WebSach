//package com.example.datn.service.impl;
//
//import com.example.datn.dto.request.LoginRequest;
//import com.example.datn.dto.request.RegisterRequest;
//import com.example.datn.dto.response.AuthResponse;
//import com.example.datn.entity.TaiKhoan;
//import com.example.datn.repository.TaiKhoanRepository;
//import com.example.datn.repository.VaiTroRepository;
//import com.example.datn.security.JwtService;
//import com.example.datn.service.AuthService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//public class AuthServiceImpl implements AuthService {
//
//    private final TaiKhoanRepository taiKhoanRepository;
//    private final VaiTroRepository vaiTroRepository;
//    private final PasswordEncoder passwordEncoder;
//    private final JwtService jwtService;
//
//    @Override
//    public AuthResponse register(RegisterRequest request) {
//
//        VaiTro vaiTro = vaiTroRepository.findByTenVaiTro("KHACH_HANG").orElseThrow();
//
//        TaiKhoan taiKhoan = TaiKhoan.builder()
//                .tenDangNhap(request.getTenDangNhap())
//                .matKhau(passwordEncoder.encode(request.getMatKhau()))
//                .hoTen(request.getHoTen())
//                .vaiTro(vaiTro)
//                .trangThai(true)
//                .build();
//
//        taiKhoanRepository.save(taiKhoan);
//
//        String token = jwtService.generateToken(
//                taiKhoan.getTenDangNhap(),
//                taiKhoan.getVaiTro().getTenVaiTro()
//        );
//
//        return AuthResponse.builder()
//                .token(token)
//                .username(taiKhoan.getTenDangNhap())
//                .role(taiKhoan.getVaiTro().getTenVaiTro())
//                .build();
//    }
//
//    @Override
//    public AuthResponse login(LoginRequest request) {
//
//        TaiKhoan taiKhoan = taiKhoanRepository
//                .findByTenDangNhap(request.getTenDangNhap())
//                .orElseThrow();
//
//        if (!passwordEncoder.matches(request.getMatKhau(), taiKhoan.getMatKhau())) {
//            throw new RuntimeException("Sai mật khẩu");
//        }
//
//        String token = jwtService.generateToken(
//                taiKhoan.getTenDangNhap(),
//                taiKhoan.getVaiTro().getTenVaiTro()
//        );
//
//        return AuthResponse.builder()
//                .token(token)
//                .username(taiKhoan.getTenDangNhap())
//                .role(taiKhoan.getVaiTro().getTenVaiTro())
//                .build();
//    }
//}
