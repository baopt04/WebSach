package com.example.datn.service;

import com.example.datn.dto.request.PosQuayGiamSoLuongRequest;
import com.example.datn.dto.request.PosQuayKhachHangNhanhRequest;
import com.example.datn.dto.request.PosQuayThanhToanRequest;
import com.example.datn.dto.request.PosQuayThemSachRequest;
import com.example.datn.dto.response.HoaDonDetailResponse;
import com.example.datn.dto.response.PosQuayHoaDonSummaryResponse;
import com.example.datn.dto.response.PosQuayKhachHangLienHeResponse;
import com.example.datn.dto.response.SachResponse;

import java.util.List;

public interface PosQuayBanHangService {

    List<PosQuayHoaDonSummaryResponse> listHoaDonTrangThaiTaoHoaDon();

    HoaDonDetailResponse taoHoaDonTrong();

    List<PosQuayKhachHangLienHeResponse> listKhachHangLienHe();

    PosQuayKhachHangLienHeResponse taoKhachHangNhanh(PosQuayKhachHangNhanhRequest request);

    HoaDonDetailResponse themSachVaoHoaDon(Integer idHoaDon, PosQuayThemSachRequest request);

    HoaDonDetailResponse xoaChiTietKhoiHoaDon(Integer idHoaDon, Integer idChiTiet);

    HoaDonDetailResponse giamSoLuongChiTiet(Integer idHoaDon, Integer idChiTiet, PosQuayGiamSoLuongRequest request);

    SachResponse timSachTheoMaVach(String maVach);

    HoaDonDetailResponse thanhToan(Integer idHoaDon, PosQuayThanhToanRequest request);
}
