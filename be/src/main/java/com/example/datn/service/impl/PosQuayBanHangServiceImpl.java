package com.example.datn.service.impl;

import com.example.datn.dto.request.PosQuayGiamSoLuongRequest;
import com.example.datn.dto.request.PosQuayKhachHangNhanhRequest;
import com.example.datn.dto.request.PosQuayThanhToanRequest;
import com.example.datn.dto.request.PosQuayThemSachRequest;
import com.example.datn.dto.response.HoaDonChiTietResponse;
import com.example.datn.dto.response.HoaDonDetailResponse;
import com.example.datn.dto.response.HoaDonResponse;
import com.example.datn.dto.response.LichSuDonHangResponse;
import com.example.datn.dto.response.PosQuayHoaDonSummaryResponse;
import com.example.datn.dto.response.PosQuayKhachHangLienHeResponse;
import com.example.datn.dto.response.SachResponse;
import com.example.datn.entity.HoaDon;
import com.example.datn.entity.HoaDonChiTiet;
import com.example.datn.entity.LichSuDonHang;
import com.example.datn.entity.MaGiamGia;
import com.example.datn.entity.MaGiamGiaChiTiet;
import com.example.datn.entity.Sach;
import com.example.datn.entity.SachHinhAnh;
import com.example.datn.entity.TaiKhoan;
import com.example.datn.enums.AccountStatus;
import com.example.datn.enums.OrderStatus;
import com.example.datn.enums.PaymentMethod;
import com.example.datn.enums.Role;
import com.example.datn.enums.TypeBill;
import com.example.datn.enums.VoucherStatus;
import com.example.datn.exception.AppException;
import com.example.datn.repository.HoaDonChiTietRepository;
import com.example.datn.repository.HoaDonRepository;
import com.example.datn.repository.LichSuDonHangRepository;
import com.example.datn.repository.MaGiamGiaChiTietRepository;
import com.example.datn.repository.MaGiamGiaRepository;
import com.example.datn.repository.SachHinhAnhRepository;
import com.example.datn.repository.SachRepository;
import com.example.datn.repository.TaiKhoanRepository;
import com.example.datn.service.PosQuayBanHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PosQuayBanHangServiceImpl implements PosQuayBanHangService {

    private final HoaDonRepository hoaDonRepository;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;
    private final LichSuDonHangRepository lichSuDonHangRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final SachRepository sachRepository;
    private final SachHinhAnhRepository sachHinhAnhRepository;
    private final MaGiamGiaRepository maGiamGiaRepository;
    private final MaGiamGiaChiTietRepository maGiamGiaChiTietRepository;
    private final PasswordEncoder passwordEncoder;


}
