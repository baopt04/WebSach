package com.example.datn.service;

import com.example.datn.dto.request.TaiKhoanRequest;
import com.example.datn.dto.response.TaiKhoanResponse;
import com.example.datn.dto.response.TaiKhoanSummaryResponse;

import java.util.List;

public interface TaiKhoanService {
    List<TaiKhoanSummaryResponse> getAll();
    TaiKhoanResponse getById(Integer id);
    TaiKhoanResponse create(TaiKhoanRequest request);
    TaiKhoanResponse update(Integer id, TaiKhoanRequest request);
    List<TaiKhoanSummaryResponse> search(String keyword);
    void delete(Integer id);
}
