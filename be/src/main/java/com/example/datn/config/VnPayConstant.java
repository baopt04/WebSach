package com.example.datn.config;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public abstract class VnPayConstant {
    public static String vnp_Version = "2.1.0";
    public static String vnp_Command = "pay";
    public static String vnp_TmnCode = "QECVZZYS";

    public static String vnp_HashSecret = "CI01S1YW22H0UMVV2AXH4O1EUA6YPJA0";
    public static String vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public static String vnp_BankCode = "";
    public static String vnp_CurrCode = "VND";
    public static String vnp_Locale = "vn";
    public static String vnp_ReturnUrl = "http://localhost:5173/order-success";
    public static String vnp_ReturnUrlBuyOnline = "http://localhost:5173/order-success";
}