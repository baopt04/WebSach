//package com.example.datn.security;
//import com.example.datn.entity.TaiKhoan;
//import com.example.datn.repository.TaiKhoanRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.context.annotation.Bean;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.*;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//
//import java.util.Collections;
//
//@Service
//@RequiredArgsConstructor
//public class CustomUserDetailsService implements UserDetailsService{
//    private final TaiKhoanRepository taiKhoanRepository;
//
//    @Override
//    public UserDetails loadUserByUsername(String username) {
//
//        TaiKhoan tk = taiKhoanRepository
//                .findByTenDangNhap(username)
//                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy"));
//
//        return org.springframework.security.core.userdetails.User
//                .withUsername(tk.getTenDangNhap())
//                .password(tk.getMatKhau())
//                .roles(tk.getVaiTro().getTenVaiTro())
//                .build();
//    }
//    @Bean
//    public CommandLineRunner runner(PasswordEncoder encoder) {
//        return args -> {
//            System.out.println("Encoded: " + encoder.encode("123456"));
//        };
//    }
//}
