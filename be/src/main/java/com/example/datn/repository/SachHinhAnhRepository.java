package com.example.datn.repository;

import com.example.datn.entity.SachHinhAnh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface SachHinhAnhRepository extends JpaRepository<SachHinhAnh, Integer> {
    List<SachHinhAnh> findBySachId(Integer idSach);
}
