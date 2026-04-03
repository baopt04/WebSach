package com.example.datn.service;





import com.example.datn.dto.request.SachRequest;
import com.example.datn.dto.SachHinhAnhDTO;
import com.example.datn.dto.response.SachResponse;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SachService {

    List<SachResponse> getAll();

    SachResponse add(SachRequest request);

    SachResponse add(SachRequest request, List<MultipartFile> images);

    SachResponse update(Integer id, SachRequest request);

    SachResponse update(Integer id, SachRequest request, List<MultipartFile> images);

    List<SachHinhAnhDTO> getImages(Integer sachId);

    SachResponse addImages(Integer sachId, List<MultipartFile> images);

    void deleteImage(Integer sachId, Integer imageId);

    void hidden(Integer id);

    SachResponse detail(Integer id);

    List<SachResponse> search(String keyword);

    List<SachResponse> findByTheLoai(Integer idTheLoai);

}
