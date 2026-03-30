package com.example.datn.service;

import com.example.datn.dto.request.CapNhatThongTinRequest;
import com.example.datn.dto.request.DiaChiCustomerRequest;
import com.example.datn.dto.request.DoiMatKhauRequest;
import com.example.datn.dto.response.DiaChiResponse;
import com.example.datn.dto.response.HoaDonCustomerSummaryResponse;
import com.example.datn.dto.response.HoaDonDetailResponse;
import com.example.datn.dto.response.TaiKhoanResponse;

import java.util.List;

public interface CustomerService {

    List<DiaChiResponse> getMyAddresses();

    DiaChiResponse createMyAddress(DiaChiCustomerRequest request);

    DiaChiResponse updateMyAddress(Integer idDiaChi, DiaChiCustomerRequest request);

    void deleteMyAddress(Integer idDiaChi);

    void setDefaultAddress(Integer idDiaChi);

    List<HoaDonCustomerSummaryResponse> getMyOrders();

    HoaDonDetailResponse getMyOrderDetail(Integer idHoaDon);

    HoaDonDetailResponse searchHoaDonByPhoneAndCode(String soDienThoai, String maHoaDon);

    TaiKhoanResponse getMyProfile();

    TaiKhoanResponse updateMyProfile(CapNhatThongTinRequest request);

    void doiMatKhau(DoiMatKhauRequest request);
}
