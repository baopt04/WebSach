package com.example.datn.repository;

import com.example.datn.entity.MaGiamGia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MaGiamGiaRepository extends JpaRepository<MaGiamGia, Integer> {
    
    @Query("SELECT m FROM MaGiamGia m WHERE LOWER(m.maVoucher) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(m.tenMaGiamGia) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY m.ngayCapNhat DESC")
    List<MaGiamGia> searchByKeyword(@Param("keyword") String keyword);

    boolean existsByTenMaGiamGia(String tenMaGiamGia);

    boolean existsByTenMaGiamGiaAndIdNot(String tenMaGiamGia, Integer id);

    List<MaGiamGia> findAllByOrderByNgayCapNhatDesc();
}
