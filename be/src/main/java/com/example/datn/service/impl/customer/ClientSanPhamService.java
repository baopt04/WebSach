package com.example.datn.service.impl.customer;

import com.example.datn.dto.response.client.ClientSachDetailResponse;
import com.example.datn.dto.response.client.ClientSanPhamResponse;
import java.util.List;

public interface ClientSanPhamService {
    List<ClientSanPhamResponse> getAllSanPham();
    List<ClientSanPhamResponse> getSanPhamBanChay();
    List<ClientSanPhamResponse> getSanPhamMoiNhat();
    ClientSachDetailResponse getChiTietSach(Integer id);
    void validateQuantity(Integer id, Integer quantity);

    List<com.example.datn.dto.response.client.ClientTheLoaiResponse> getAllTheLoai();
    List<ClientSanPhamResponse> getSanPhamByTheLoai(Integer idTheLoai);

    List<com.example.datn.dto.response.client.ClientNhaXuatBanResponse> getAllNhaXuatBan();
    List<ClientSanPhamResponse> getSanPhamByNhaXuatBan(Integer idNhaXuatBan);
}
