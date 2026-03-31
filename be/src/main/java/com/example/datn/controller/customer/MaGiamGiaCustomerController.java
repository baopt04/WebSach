package com.example.datn.controller.customer;

import com.example.datn.dto.response.magiamgia.ClientVoucherResponse;
import com.example.datn.service.CustomerMaGiamGiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/customer/v1/ma-giam-gia")
public class MaGiamGiaCustomerController {

    @Autowired
    private CustomerMaGiamGiaService customerMaGiamGiaService;

    @GetMapping("/hop-le")
    public ResponseEntity<List<ClientVoucherResponse>> getEligibleVouchers(@RequestParam BigDecimal tongTien) {
        return ResponseEntity.ok(customerMaGiamGiaService.getVouchersTuongThich(tongTien));
    }
}
