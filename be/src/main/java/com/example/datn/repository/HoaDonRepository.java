package com.example.datn.repository;

import com.example.datn.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface HoaDonRepository extends JpaRepository<HoaDon, Integer> {
    List<HoaDon> findAllByOrderByNgayCapNhatDesc();
    
    @Query("SELECT h FROM HoaDon h WHERE " +
           "LOWER(h.maHoaDon) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.soDienThoai) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY h.ngayCapNhat DESC")
    List<HoaDon> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT h FROM HoaDon h WHERE h.ngayTao >= :tuNgay AND h.ngayTao <= :denNgay ORDER BY h.ngayCapNhat DESC")
    List<HoaDon> findByNgayTaoBetween(@Param("tuNgay") LocalDateTime tuNgay, @Param("denNgay") LocalDateTime denNgay);

    List<HoaDon> findByKhachHangIdOrderByNgayCapNhatDesc(Integer idKhachHang);

    java.util.Optional<HoaDon> findBySoDienThoaiAndMaHoaDon(String soDienThoai, String maHoaDon);

    Optional<HoaDon> findByMaHoaDon(String maHoaDon);
}

