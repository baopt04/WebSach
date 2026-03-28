package com.example.datn.repository;

import com.example.datn.entity.SachTacGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface SachTacGiaRepository extends JpaRepository<SachTacGia, Integer> {
    Optional<SachTacGia> findBySachId(Integer Sachid);
}
