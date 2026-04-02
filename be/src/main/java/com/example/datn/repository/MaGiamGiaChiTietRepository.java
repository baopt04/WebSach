package com.example.datn.repository;

import com.example.datn.entity.MaGiamGiaChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MaGiamGiaChiTietRepository extends JpaRepository<MaGiamGiaChiTiet, Integer> {

    Optional<MaGiamGiaChiTiet> findFirstByHoaDon_Id(Integer hoaDonId);
}
