package com.example.datn.repository;

import com.example.datn.entity.GioHang;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GioHangRepository extends JpaRepository<GioHang, Integer> {
    Optional<GioHang> findByKhachHangId(Integer idKhachHang);
}