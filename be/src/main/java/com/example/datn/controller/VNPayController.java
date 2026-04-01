package com.example.datn.controller;

import com.example.datn.dto.request.CreatePayMentMethodRequest;
import com.example.datn.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.Map;


@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class VNPayController {

    private final VNPayService vnPayService;

    /**
     * Tạo URL thanh toán VNPay.
     * POST /api/payment/payment-vnpay
     * Body: { "vnp_TxnRef": "HD001", "vnp_Amount": "500000", ... }
     */
    @PostMapping("/payment-vnpay")
    public ResponseEntity<String> payWithVnPay(
            @RequestBody CreatePayMentMethodRequest payModel,
            HttpServletRequest request) {
        try {
            String paymentUrl = vnPayService.payWithVnpay(payModel, request);
            return ResponseEntity.ok(paymentUrl);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (UnsupportedEncodingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating payment URL: " + e.getMessage());
        }
    }

    /**
     * VNPay redirect trình duyệt về đây sau khi khách thanh toán.
     * GET /api/payment/vnpay-success?vnp_ResponseCode=00&vnp_TxnRef=HD001&...
     * VNPay dùng GET request với query params, KHÔNG phải POST.
     */
    @GetMapping("/vnpay-success")
    public ResponseEntity<String> vnPayCallback(@RequestParam Map<String, String> params) {
        boolean paymentSuccess = vnPayService.paymentSucessFully(params);
        if (paymentSuccess) {
            return ResponseEntity.ok("Thanh toán thành công");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Thanh toán không thành công");
        }
    }
}
