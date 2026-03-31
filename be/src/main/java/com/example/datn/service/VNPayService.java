package com.example.datn.service;

import com.example.datn.dto.request.CreatePayMentMethodRequest;
import com.example.datn.dto.response.PayMentVnPayResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.UnsupportedEncodingException;
import java.util.Map;

public interface VNPayService {

    String payWithVnpay(CreatePayMentMethodRequest payModel , HttpServletRequest request) throws UnsupportedEncodingException;
    boolean paymentSucessFully(PayMentVnPayResponse response);

}
