package com.example.datn.service;


import com.example.datn.dto.request.HoaDonCreateRequest;
import com.example.datn.dto.request.HoaDonUpdateRequest;
import com.example.datn.dto.request.PosHoaDonCreateRequest;
import com.example.datn.dto.request.PosHoaDonThemHangRequest;
import com.example.datn.dto.request.TrangThaiHoaDonRequest;
import com.example.datn.dto.response.HoaDonDetailResponse;
import com.example.datn.dto.response.HoaDonResponse;
import com.example.datn.dto.response.LichSuDonHangResponse;

import java.time.LocalDate;
import java.util.List;

public interface HoaDonService {
    List<HoaDonResponse> getAllHoaDon();
    HoaDonDetailResponse getHoaDonChiTietByHoaDonId(Integer idHoaDon);
    HoaDonResponse changeOrderStatus(Integer idHoaDon, TrangThaiHoaDonRequest request);
    List<LichSuDonHangResponse> getLichSuByHoaDonId(Integer idHoaDon);
    HoaDonResponse updateHoaDon(Integer id, HoaDonUpdateRequest request);
    HoaDonResponse createHoaDonKhachHang(HoaDonCreateRequest request);
    String clientCancelOrder(Integer idHoaDon, TrangThaiHoaDonRequest request);
    List<HoaDonResponse> searchHoaDonByKeyword(String keyword);
    List<HoaDonResponse> searchHoaDonByDateRange(LocalDate tuNgay, LocalDate denNgay);

    /** Bán tại quầy: tạo hóa đơn nháp, nhân viên = user đăng nhập */
    HoaDonDetailResponse taoHoaDonBanTaiQuay(PosHoaDonCreateRequest request);

    /** Thêm dòng hàng, trừ tồn kho */
    HoaDonDetailResponse themHangBanTaiQuay(Integer idHoaDon, PosHoaDonThemHangRequest request);

}
