package com.example.datn.service.impl;

import com.example.datn.dto.response.DoanhThuTheoThangResponse;
import com.example.datn.dto.response.HoaDonResponse;
import com.example.datn.dto.response.SachBanChayResponse;
import com.example.datn.dto.response.ThongKeSoDonTheoTrangThaiResponse;
import com.example.datn.dto.response.ThongKeSoDonTrangThaiTheoNgayResponse;
import com.example.datn.dto.response.ThongKeTongHopResponse;
import com.example.datn.entity.HoaDon;
import com.example.datn.enums.OrderStatus;
import com.example.datn.repository.HoaDonChiTietRepository;
import com.example.datn.repository.HoaDonRepository;
import com.example.datn.repository.SachRepository;
import com.example.datn.service.ThongKeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ThongKeServiceImpl implements ThongKeService {

    private final HoaDonRepository hoaDonRepository;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;
    private final SachRepository sachRepository;

    @Override
    public long getTotalOrders() {
        return hoaDonRepository.count();
    }

    @Override
    public BigDecimal getTotalRevenue() {
        BigDecimal total = hoaDonRepository.getTotalRevenue(OrderStatus.THANH_CONG);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public BigDecimal getRevenueByMonth(int month, int year) {
        BigDecimal total = hoaDonRepository.getRevenueByMonth(month, year, OrderStatus.THANH_CONG);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public long getTotalOrdersByMonth(int month, int year) {
        return hoaDonRepository.countOrdersByMonth(month, year);
    }

    @Override
    public long getTotalCancelledOrders() {
        return hoaDonRepository.countByTrangThai(OrderStatus.DA_HUY);
    }

    @Override
    public List<SachBanChayResponse> getTop10BestSellingBooks() {
        return hoaDonChiTietRepository.findTopSellingBooks(OrderStatus.THANH_CONG, PageRequest.of(0, 10));
    }

    @Override
    public List<DoanhThuTheoThangResponse> getRevenueAndOrdersByMonths(int year) {
        List<DoanhThuTheoThangResponse> DBResult = hoaDonRepository.getRevenueAndOrdersByMonths(year, OrderStatus.THANH_CONG);
        
        // Ensure 12 months are returned even if there is no data
        List<DoanhThuTheoThangResponse> result = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            boolean found = false;
            for (DoanhThuTheoThangResponse res : DBResult) {
                if (res.getThang() == i) {
                    result.add(res);
                    found = true;
                    break;
                }
            }
            if (!found) {
                result.add(DoanhThuTheoThangResponse.builder()
                        .thang(i)
                        .nam(year)
                        .tongDoanhThu(BigDecimal.ZERO)
                        .tongDonHang(0L)
                        .build());
            }
        }
        return result;
    }

    @Override
    public ThongKeTongHopResponse getThongKeTongHop() {
        long totalOrders = hoaDonRepository.count();
        BigDecimal totalRevenue = hoaDonRepository.getTotalRevenue(OrderStatus.THANH_CONG);
        List<DoanhThuTheoThangResponse> monthlyStats = hoaDonRepository.getMonthlyStats(OrderStatus.THANH_CONG);

        return ThongKeTongHopResponse.builder()
                .tongDonHang(totalOrders)
                .tongDoanhThu(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .chiTietTheoThang(monthlyStats)
                .build();
    }

    @Override
    public List<HoaDonResponse> getMuoiDonHangGanNhat() {
        return hoaDonRepository
                .findByTrangThaiNotOrderByNgayCapNhatDesc(OrderStatus.TAO_HOA_DON, PageRequest.of(0, 10))
                .getContent()
                .stream()
                .map(this::mapToHoaDonResponse)
                .collect(Collectors.toList());
    }

    @Override
    public long getTongSoSanPhamDangHoatDong() {
        return sachRepository.countByTrangThaiTrue();
    }

    @Override
    public ThongKeSoDonTrangThaiTheoNgayResponse getSoDonTheoTrangThaiTrongNgay(LocalDate ngay) {
        LocalDate d = ngay != null ? ngay : LocalDate.now();
        LocalDateTime tu = d.atStartOfDay();
        LocalDateTime den = d.plusDays(1).atStartOfDay();
        List<Object[]> rows = hoaDonRepository.countByTrangThaiForNgayCapNhatRange(OrderStatus.TAO_HOA_DON, tu, den);
        Map<OrderStatus, Long> map = new EnumMap<>(OrderStatus.class);
        for (Object[] row : rows) {
            OrderStatus st = (OrderStatus) row[0];
            long cnt = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
            map.put(st, cnt);
        }
        List<ThongKeSoDonTheoTrangThaiResponse> chiTiet = new ArrayList<>();
        for (OrderStatus st : OrderStatus.values()) {
            if (st == OrderStatus.TAO_HOA_DON) {
                continue;
            }
            chiTiet.add(ThongKeSoDonTheoTrangThaiResponse.builder()
                    .trangThai(st)
                    .soLuong(map.getOrDefault(st, 0L))
                    .build());
        }
        BigDecimal tongDoanhThu = hoaDonRepository.sumTongTienSauGiamByTrangThaiInNgayCapNhatRange(
                OrderStatus.THANH_CONG, tu, den);
        if (tongDoanhThu == null) {
            tongDoanhThu = BigDecimal.ZERO;
        }
        return ThongKeSoDonTrangThaiTheoNgayResponse.builder()
                .ngay(d)
                .tongDoanhThuThanhCong(tongDoanhThu)
                .theoTrangThai(chiTiet)
                .build();
    }

    private HoaDonResponse mapToHoaDonResponse(HoaDon hd) {
        return HoaDonResponse.builder()
                .id(hd.getId())
                .maHoaDon(hd.getMaHoaDon())
                .hoTenKhachHang(hd.getHoTen())
                .soDienThoai(hd.getSoDienThoai())
                .email(hd.getEmail())
                .diaChiGiaoHang(hd.getDiaChiGiaoHang())
                .tongTienHang(hd.getTongTienHang())
                .phiShip(hd.getPhiShip())
                .giamGia(hd.getGiamGia())
                .trangThai(hd.getTrangThai())
                .phuongThuc(hd.getPhuongThuc())
                .ngayNhan(hd.getNgayNhan())
                .loaiHoaDon(hd.getLoaiHoaDon())
                .ghiChu(hd.getGhiChu())
                .ngayTao(hd.getNgayTao())
                .ngayCapNhat(hd.getNgayCapNhat())
                .build();
    }
}
