package com.example.datn.controller;

import com.example.datn.dto.request.PosQuayGiamSoLuongRequest;
import com.example.datn.dto.request.PosQuayKhachHangNhanhRequest;
import com.example.datn.dto.request.PosQuayThanhToanRequest;
import com.example.datn.dto.request.PosQuayThemSachRequest;
import com.example.datn.dto.response.HoaDonDetailResponse;
import com.example.datn.dto.response.PosQuayHoaDonSummaryResponse;
import com.example.datn.dto.response.PosQuayKhachHangLienHeResponse;
import com.example.datn.dto.response.SachResponse;
import com.example.datn.service.PosQuayBanHangService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/v1/pos-quay")
@RequiredArgsConstructor
public class PosQuayBanHangController {


}
