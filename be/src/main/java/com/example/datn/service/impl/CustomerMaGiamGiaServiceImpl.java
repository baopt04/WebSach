package com.example.datn.service.impl;

import com.example.datn.dto.response.magiamgia.ClientVoucherResponse;
import com.example.datn.entity.MaGiamGia;
import com.example.datn.repository.MaGiamGiaRepository;
import com.example.datn.service.CustomerMaGiamGiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerMaGiamGiaServiceImpl implements CustomerMaGiamGiaService {

    @Autowired
    private MaGiamGiaRepository maGiamGiaRepository;

    @Override
    public List<ClientVoucherResponse> getVouchersTuongThich(BigDecimal tongTien) {
        List<MaGiamGia> list = maGiamGiaRepository.findVouchersForCustomer(tongTien);
        return list.stream().map(m -> ClientVoucherResponse.builder()
                .id(m.getId())
                .maVoucher(m.getMaVoucher())
                .tenMaGiamGia(m.getTenMaGiamGia())
                .giaTriGiam(m.getGiaTriGiam())
                .voucherType(m.getVoucherType())
                .giamToiDa(m.getGiamToiDa())
                .tienToiThieu(m.getTienToiThieu())
                .soLuong(m.getSoLuong())
                .ngayKetThuc(m.getNgayKetThuc())
                .build()).collect(Collectors.toList());
    }
}
