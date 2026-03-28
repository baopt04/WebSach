package com.example.datn.repository;

import com.example.datn.entity.Sach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface SachRepository extends JpaRepository<Sach, Integer> {


    Optional<Sach> findByMaSach(String maSach);
}