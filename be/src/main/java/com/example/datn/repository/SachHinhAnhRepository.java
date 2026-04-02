package com.example.datn.repository;

import com.example.datn.entity.SachHinhAnh;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SachHinhAnhRepository extends JpaRepository<SachHinhAnh, Integer> {
    List<SachHinhAnh> findBySachId(Integer idSach);
    List<SachHinhAnh> findBySachIdIn(List<Integer> sachIds);
    Optional<SachHinhAnh> findFirstBySach_IdAndLaAnhChinhTrue(Integer idSach);
}
