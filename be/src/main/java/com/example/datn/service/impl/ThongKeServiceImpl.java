package com.example.datn.service.impl;

import com.example.datn.dto.response.DoanhThuTheoThangResponse;
import com.example.datn.dto.response.SachBanChayResponse;
import com.example.datn.dto.response.ThongKeTongHopResponse;
import com.example.datn.enums.OrderStatus;
import com.example.datn.repository.HoaDonChiTietRepository;
import com.example.datn.repository.HoaDonRepository;
import com.example.datn.service.ThongKeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ThongKeServiceImpl implements ThongKeService {

    private final HoaDonRepository hoaDonRepository;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;

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
}
