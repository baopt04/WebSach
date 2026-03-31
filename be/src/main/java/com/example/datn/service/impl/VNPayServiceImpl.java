package com.example.datn.service.impl;

import com.example.datn.config.VnPayConstant;
import com.example.datn.dto.request.CreatePayMentMethodRequest;
import com.example.datn.dto.response.PayMentVnPayResponse;
import com.example.datn.entity.GioHang;
import com.example.datn.entity.HoaDon;
import com.example.datn.entity.HoaDonChiTiet;
import com.example.datn.entity.LichSuDonHang;
import com.example.datn.entity.Sach;
import com.example.datn.entity.TaiKhoan;
import com.example.datn.enums.OrderStatus;
import com.example.datn.repository.GioHangChiTietRepository;
import com.example.datn.repository.GioHangRepository;
import com.example.datn.repository.HoaDonChiTietRepository;
import com.example.datn.repository.HoaDonRepository;
import com.example.datn.repository.LichSuDonHangRepository;
import com.example.datn.repository.SachRepository;
import com.example.datn.service.VNPayService;
import com.example.datn.util.Config;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VNPayServiceImpl implements VNPayService {

//    private final HoaDonRepository hoaDonRepository;
//    private final HoaDonChiTietRepository hoaDonChiTietRepository;
//    private final SachRepository sachRepository;
//    private final LichSuDonHangRepository lichSuDonHangRepository;
//    private final GioHangRepository gioHangRepository;
//    private final GioHangChiTietRepository gioHangChiTietRepository;


    @Override
    public String payWithVnpay(CreatePayMentMethodRequest payModel, HttpServletRequest request) throws UnsupportedEncodingException {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        LocalDateTime expireTime = now.plusMinutes(15);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String vnp_CreateDate = now.format(formatter);
        String vnp_ExpireDate = expireTime.format(formatter);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", VnPayConstant.vnp_Version);
        vnp_Params.put("vnp_Command", VnPayConstant.vnp_Command);
        vnp_Params.put("vnp_TmnCode", VnPayConstant.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", payModel.getVnp_Amount() + "00");
        vnp_Params.put("vnp_BankCode", VnPayConstant.vnp_BankCode);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_CurrCode", VnPayConstant.vnp_CurrCode);
        vnp_Params.put("vnp_IpAddr", Config.getIpAddress(request));
        vnp_Params.put("vnp_Locale", VnPayConstant.vnp_Locale);
        vnp_Params.put("vnp_OrderInfo", payModel.getVnp_OrderInfo());
        vnp_Params.put("vnp_OrderType", payModel.getVnp_OrderType());
        vnp_Params.put("vnp_ReturnUrl", VnPayConstant.vnp_ReturnUrl);
        vnp_Params.put("vnp_TxnRef", String.valueOf(payModel.getVnp_TxnRef()));
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        List fieldList = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldList);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        Iterator itr = fieldList.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append("=");
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append("=");
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                if (itr.hasNext()) {
                    query.append("&");
                    hashData.append("&");
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = Config.hmacSHA512(VnPayConstant.vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = VnPayConstant.vnp_Url + "?" + queryUrl;
        return paymentUrl;
    }

    @Override
    public boolean paymentSucessFully(PayMentVnPayResponse response) {
        if (response.getVnp_ResponseCode().equals("00")) {
            String billCode = response.getVnp_TxnRef().split("-")[0];
        }else {

        }
        return true;
    }
}
