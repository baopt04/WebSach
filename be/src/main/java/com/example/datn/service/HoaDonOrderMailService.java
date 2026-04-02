package com.example.datn.service;

import com.example.datn.dto.mail.OrderMailLine;
import com.example.datn.entity.HoaDon;
import com.example.datn.entity.MaGiamGia;

import java.util.List;

public interface HoaDonOrderMailService {

    void sendOrderPlacedEmail(HoaDon hoaDon, List<OrderMailLine> lines, MaGiamGia maGiamGiaOrNull);

    void sendOrderPlacedEmailFromPersistedOrder(HoaDon hoaDon);
}
