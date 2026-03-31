package com.example.datn.repository;

import com.example.datn.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Integer> {
    Optional<TaiKhoan> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT COUNT(t) > 0 FROM TaiKhoan t WHERE t.email = :email AND t.id <> :id")

    boolean existsByEmailAndIdNot(@Param("email") String email, @Param("id") Integer id);

    boolean existsBySoDienThoai(String soDienThoai);

    @Query("SELECT COUNT(t) > 0 FROM TaiKhoan t WHERE t.soDienThoai = :soDienThoai AND t.id <> :id")
    boolean existsBySoDienThoaiAndIdNot(@Param("soDienThoai") String soDienThoai, @Param("id") Integer id);


    @Query("SELECT t FROM TaiKhoan t WHERE LOWER(t.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY t.ngayCapNhat DESC")
    List<TaiKhoan> searchByKeyword(@Param("keyword") String keyword);

    List<TaiKhoan> findAllByOrderByNgayCapNhatDesc();

}
