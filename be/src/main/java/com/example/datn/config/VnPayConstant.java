package com.example.datn.config;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public abstract class VnPayConstant {
    public static String vnp_Version = "2.1.0";
    public static String vnp_Command = "2.1.0";
    public static String vnp_TmnCode = "7YVJITMP";

    public static String vnp_HashSecret = "709PEK9WH83SF3TN8V54O9JWCG7JA0DN";
    public static String vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public static String vnp_Refound ="https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
    public static String vnp_BankCode = "";
    public static String vnp_CurrCode = "VND";
    public static String vnp_Locale = "vn";
    public static String vnp_ReturnUrl = "http://localhost:8080/payment-success";
    public static String vnp_ReturnUrl2 = "http://localhost:8080/payment-success-NoLogin";
}