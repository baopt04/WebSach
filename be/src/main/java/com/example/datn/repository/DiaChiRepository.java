package com.example.datn.repository;

import com.example.datn.entity.DiaChi;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiaChiRepository extends JpaRepository<DiaChi, Integer> {
    
    List<DiaChi> findAllByOrderByNgayCapNhatDesc();
    
    List<DiaChi> findByTaiKhoanIdOrderByNgayCapNhatDesc(Integer idTaiKhoan);
}
