package com.example.datn.service;

import com.example.datn.dto.request.DiaChiRequest;
import com.example.datn.dto.response.DiaChiResponse;

import java.util.List;

public interface DiaChiService {
    List<DiaChiResponse> getAll();
    List<DiaChiResponse> getByTaiKhoanId(Integer idTaiKhoan);
    DiaChiResponse create(DiaChiRequest request);
    DiaChiResponse update(Integer id, DiaChiRequest request);
    void delete(Integer id);
    void setDefault(Integer id);
}
