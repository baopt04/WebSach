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

    long countByTrangThai(com.example.datn.enums.OrderStatus trangThai);

    @Query("SELECT SUM(h.tongTienHang - h.giamGia) FROM HoaDon h WHERE h.trangThai = :trangThai")
    java.math.BigDecimal getTotalRevenue(@Param("trangThai") com.example.datn.enums.OrderStatus trangThai);

    @Query("SELECT SUM(h.tongTienHang - h.giamGia) FROM HoaDon h WHERE h.trangThai = :trangThai AND YEAR(h.ngayTao) = :year AND MONTH(h.ngayTao) = :month")
    java.math.BigDecimal getRevenueByMonth(@Param("month") int month, @Param("year") int year, @Param("trangThai") com.example.datn.enums.OrderStatus trangThai);

    @Query("SELECT COUNT(h) FROM HoaDon h WHERE YEAR(h.ngayTao) = :year AND MONTH(h.ngayTao) = :month")
    long countOrdersByMonth(@Param("month") int month, @Param("year") int year);

    @Query("SELECT new com.example.datn.dto.response.DoanhThuTheoThangResponse(MONTH(h.ngayTao), YEAR(h.ngayTao), COALESCE(SUM(h.tongTienHang - h.giamGia), 0), COUNT(h.id)) " +
           "FROM HoaDon h " +
           "WHERE h.trangThai = :trangThai AND YEAR(h.ngayTao) = :year " +
           "GROUP BY YEAR(h.ngayTao), MONTH(h.ngayTao)")
    List<com.example.datn.dto.response.DoanhThuTheoThangResponse> getRevenueAndOrdersByMonths(@Param("year") int year, @Param("trangThai") com.example.datn.enums.OrderStatus trangThai);

    @Query("SELECT new com.example.datn.dto.response.DoanhThuTheoThangResponse(MONTH(h.ngayTao), YEAR(h.ngayTao), COALESCE(SUM(h.tongTienHang - h.giamGia), 0), COUNT(h.id)) " +
           "FROM HoaDon h " +
           "WHERE h.trangThai = :trangThai " +
           "GROUP BY YEAR(h.ngayTao), MONTH(h.ngayTao) " +
           "ORDER BY YEAR(h.ngayTao) DESC, MONTH(h.ngayTao) DESC")
    List<com.example.datn.dto.response.DoanhThuTheoThangResponse> getMonthlyStats(@Param("trangThai") com.example.datn.enums.OrderStatus trangThai);
}


