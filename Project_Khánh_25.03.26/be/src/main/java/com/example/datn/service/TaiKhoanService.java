package com.example.datn.service;

import com.example.datn.entity.TaiKhoan;

import java.util.List;
public interface TaiKhoanService {
    List<TaiKhoan> getAll();

    TaiKhoan getById(Integer id);

    TaiKhoan create(TaiKhoan taiKhoan);

    TaiKhoan update(Integer id, TaiKhoan taiKhoan);

    void delete(Integer id);
}
