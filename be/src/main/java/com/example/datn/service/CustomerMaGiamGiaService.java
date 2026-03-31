package com.example.datn.service;

import com.example.datn.dto.response.magiamgia.ClientVoucherResponse;

import java.math.BigDecimal;
import java.util.List;

public interface CustomerMaGiamGiaService {
    List<ClientVoucherResponse> getVouchersTuongThich(BigDecimal tongTien);
}
