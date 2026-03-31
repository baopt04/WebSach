package com.example.datn.controller;

import com.example.datn.dto.request.CreatePayMentMethodRequest;
import com.example.datn.dto.response.PayMentVnPayResponse;
import com.example.datn.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.Map;


@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class VNPayController {
@Autowired
    private VNPayService vnPayService;

    @PostMapping("/payment-vnpay")
    public ResponseEntity<String> payWithVnPay(@RequestBody CreatePayMentMethodRequest payModel, HttpServletRequest request) {
        try {
            String paymetUrl = vnPayService.payWithVnpay(payModel, request);
            return ResponseEntity.ok(paymetUrl);  // Trả về URL thanh toán với mã trạng thái 200 OK
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating payment URL: " + e.getMessage());
        }
    }

    @PostMapping("/vnpay-success")
    public ResponseEntity<String> vnPayCallback(@RequestBody PayMentVnPayResponse response) {
        boolean paymentSuccess = vnPayService.paymentSucessFully(response);
        if (paymentSuccess) {
            return ResponseEntity.ok("Thanh toán thành công");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Thanh toán không thành công");
        }
    }
}
