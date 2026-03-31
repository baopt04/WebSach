package com.example.datn.service;

import com.example.datn.dto.request.MaGiamGiaRequest;
import com.example.datn.dto.response.MaGiamGiaResponse;

import java.util.List;

public interface MaGiamGiaService {
    List<MaGiamGiaResponse> getAll();
    MaGiamGiaResponse getById(Integer id);
    MaGiamGiaResponse create(MaGiamGiaRequest request);
    MaGiamGiaResponse update(Integer id, MaGiamGiaRequest request);
    List<MaGiamGiaResponse> search(String keyword);
}
