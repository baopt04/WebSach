package com.example.datn.repository;

import com.example.datn.entity.GioHangChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GioHangChiTietRepository extends JpaRepository<GioHangChiTiet, Integer> {
    Optional<GioHangChiTiet> findByGioHangIdAndSachId(Integer idGioHang, Integer idSach);
    List<GioHangChiTiet> findByGioHangId(Integer idGioHang);
}
