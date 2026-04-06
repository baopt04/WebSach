package com.example.datn.repository;


import com.example.datn.entity.HoaDonChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HoaDonChiTietRepository extends JpaRepository<HoaDonChiTiet, Integer> {
    List<HoaDonChiTiet> findByHoaDonId(Integer idHoaDon);

    Optional<HoaDonChiTiet> findByHoaDon_IdAndSach_Id(Integer idHoaDon, Integer idSach);

    @Query("SELECT c FROM HoaDonChiTiet c LEFT JOIN FETCH c.sach WHERE c.hoaDon.id = :hoaDonId")
    List<HoaDonChiTiet> findByHoaDonIdFetchSach(@Param("hoaDonId") Integer hoaDonId);

    @org.springframework.data.jpa.repository.Query("SELECT new com.example.datn.dto.response.SachBanChayResponse(s.id, s.tenSach, tl.tenTheLoai, SUM(hdct.soLuong), SUM(hdct.soLuong * hdct.donGia)) " +
           "FROM HoaDonChiTiet hdct " +
           "JOIN hdct.sach s " +
           "LEFT JOIN s.theLoai tl " +
           "WHERE hdct.hoaDon.trangThai = :trangThai " +
           "GROUP BY s.id, s.tenSach, tl.tenTheLoai " +
           "ORDER BY SUM(hdct.soLuong) DESC")
    List<com.example.datn.dto.response.SachBanChayResponse> findTopSellingBooks(@org.springframework.data.repository.query.Param("trangThai") com.example.datn.enums.OrderStatus trangThai, org.springframework.data.domain.Pageable pageable);
}