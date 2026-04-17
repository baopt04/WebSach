package com.example.datn.repository;

import com.example.datn.entity.Sach;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SachRepository extends JpaRepository<Sach, Integer> {
    
    @Query("SELECT s FROM Sach s WHERE s.trangThai = true ORDER BY s.ngayTao DESC")
    List<Sach> findTop10Newest(Pageable pageable);

    @Query("SELECT s.id FROM HoaDonChiTiet hdct " +
           "JOIN hdct.hoaDon hd " +
           "JOIN hdct.sach s " +
           "WHERE hd.trangThai = 'THANH_CONG' AND s.trangThai = true " +
           "GROUP BY s.id " +
           "ORDER BY SUM(hdct.soLuong) DESC")
    List<Integer> findBestSellingSachIds(Pageable pageable);

    List<Sach> findByTheLoaiIdAndTrangThaiTrue(Integer idTheLoai);
    List<Sach> findByNhaXuatBanIdAndTrangThaiTrue(Integer idNhaXuatBan);
    List<Sach> findByTrangThaiTrue();

    long countByTrangThaiTrue();

    Optional<Sach> findByMaSach(String maSach);

    Optional<Sach> findFirstByMaVach(String maVach);
    List<Sach> findByTenSachContainingIgnoreCase(String keyword);
    List<Sach> findByTenSachContainingIgnoreCaseAndTrangThaiTrue(String keyword);

    List<Sach> findByTheLoai_Id(Integer idTheLoai);

}