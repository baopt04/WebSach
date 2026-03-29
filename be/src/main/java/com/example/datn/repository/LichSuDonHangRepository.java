package com.example.datn.repository;

import com.example.datn.entity.LichSuDonHang;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LichSuDonHangRepository extends JpaRepository<LichSuDonHang, Integer> {
    List<LichSuDonHang> findByHoaDonIdOrderByNgayTaoDesc(Integer idHoaDon);
}
