package com.example.datn.service;

import com.example.datn.dto.request.CreatePayMentMethodRequest;
import jakarta.servlet.http.HttpServletRequest;

import java.io.UnsupportedEncodingException;
import java.util.Map;

public interface VNPayService {

    String payWithVnpay(CreatePayMentMethodRequest payModel , HttpServletRequest request) throws UnsupportedEncodingException;
    boolean paymentSucessFully(Map<String, String> params);

}
