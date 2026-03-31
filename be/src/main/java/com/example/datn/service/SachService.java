package com.example.datn.service;





import com.example.datn.dto.request.SachRequest;
import com.example.datn.dto.response.SachResponse;

import java.util.List;

public interface SachService {

    List<SachResponse> getAll();

    SachResponse add(SachRequest request);

    SachResponse update(Integer id, SachRequest request);

    void hidden(Integer id);

    SachResponse detail(Integer id);

    List<SachResponse> search(String keyword);

    List<SachResponse> findByTheLoai(Integer idTheLoai);

}
