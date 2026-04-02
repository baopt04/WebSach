package com.example.datn.service;

import com.example.datn.dto.response.DoanhThuTheoThangResponse;
import com.example.datn.dto.response.SachBanChayResponse;

import java.math.BigDecimal;
import java.util.List;

public interface ThongKeService {

    long getTotalOrders();

    BigDecimal getTotalRevenue();

    BigDecimal getRevenueByMonth(int month, int year);

    long getTotalOrdersByMonth(int month, int year);

    long getTotalCancelledOrders();

    List<SachBanChayResponse> getTop10BestSellingBooks();

    List<DoanhThuTheoThangResponse> getRevenueAndOrdersByMonths(int year);

    com.example.datn.dto.response.ThongKeTongHopResponse getThongKeTongHop();
}
