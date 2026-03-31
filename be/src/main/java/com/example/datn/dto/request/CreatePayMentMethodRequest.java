package com.example.datn.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePayMentMethodRequest {
    private String vnp_OrderInfo = "Thanh toan hoa don";
    private String vnp_OrderType = "Thanh toan hoa don";
    private String vnp_TxnRef;
    private String vnp_Amount;
    private String userType;
}
