package com.example.datn.repository;

import com.example.datn.entity.SachTacGia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SachTacGiaRepository extends JpaRepository<SachTacGia, Integer> {
    List<SachTacGia> findBySachIdIn(List<Integer> sachIds);
    Optional<SachTacGia> findBySachId(Integer Sachid);

}
