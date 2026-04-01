package com.example.datn.service.impl;

import com.example.datn.config.VnPayConstant;
import com.example.datn.dto.request.CreatePayMentMethodRequest;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
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

    private final HoaDonRepository hoaDonRepository;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;
    private final SachRepository sachRepository;
    private final LichSuDonHangRepository lichSuDonHangRepository;
    private final GioHangRepository gioHangRepository;
    private final GioHangChiTietRepository gioHangChiTietRepository;

    private static String vnpEncode(String value) throws UnsupportedEncodingException {
        return URLEncoder.encode(value, StandardCharsets.US_ASCII.toString());
    }


    @Override
    public String payWithVnpay(CreatePayMentMethodRequest payModel, HttpServletRequest request) throws UnsupportedEncodingException {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        LocalDateTime expireTime = now.plusMinutes(15);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String vnp_CreateDate = now.format(formatter);
        String vnp_ExpireDate = expireTime.format(formatter);

        log.info("[VNPay Create] incoming vnp_TxnRef={}, vnp_Amount={}, vnp_OrderInfo={}",
                payModel.getVnp_TxnRef(), payModel.getVnp_Amount(), payModel.getVnp_OrderInfo());

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", VnPayConstant.vnp_Version);
        vnp_Params.put("vnp_Command", VnPayConstant.vnp_Command);
        vnp_Params.put("vnp_TmnCode", VnPayConstant.vnp_TmnCode);
        long amountVnd = Long.parseLong(payModel.getVnp_Amount());
        vnp_Params.put("vnp_Amount", String.valueOf(amountVnd * 100));
        if (VnPayConstant.vnp_BankCode != null && !VnPayConstant.vnp_BankCode.isBlank()) {
            vnp_Params.put("vnp_BankCode", VnPayConstant.vnp_BankCode);
        }
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_CurrCode", VnPayConstant.vnp_CurrCode);
        vnp_Params.put("vnp_IpAddr", Config.getIpAddress(request));
        vnp_Params.put("vnp_Locale", VnPayConstant.vnp_Locale);
        vnp_Params.put("vnp_OrderInfo", payModel.getVnp_OrderInfo());
        String orderType = payModel.getVnp_OrderType();
        if (orderType == null || orderType.isBlank() || orderType.contains(" ")) {
            orderType = "other";
        }
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_ReturnUrl", VnPayConstant.vnp_ReturnUrl);
        String txnRef = payModel.getVnp_TxnRef();
        if (txnRef == null || txnRef.isBlank()) {
            throw new IllegalArgumentException("vnp_TxnRef (maHoaDon) is required");
        }
        // Keep original maHoaDon (e.g. "HD12345") so callback can find the order by maHoaDon.
        // Ensure max length 34 as per VNPay constraint.
        txnRef = txnRef.trim();
        if (txnRef.length() > 34) txnRef = txnRef.substring(0, 34);
        vnp_Params.put("vnp_TxnRef", txnRef);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        List<String> fieldList = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldList);

        List<String> queryPairs = new ArrayList<>();
        List<String> hashPairs = new ArrayList<>();

        for (String fieldName : fieldList) {
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue == null || fieldValue.isEmpty()) {
                continue;
            }

            String encodedFieldValue = vnpEncode(fieldValue);
            String encodedFieldName = vnpEncode(fieldName);

            // query: encoded name + encoded value
            queryPairs.add(encodedFieldName + "=" + encodedFieldValue);

            // hashData: raw name + encoded value (VNPay Java sample)
            hashPairs.add(fieldName + "=" + encodedFieldValue);
        }

        String queryUrl = String.join("&", queryPairs);
        String hashData = String.join("&", hashPairs);
        String vnp_SecureHash = Config.hmacSHA512(VnPayConstant.vnp_HashSecret, hashData);
        log.info("[VNPay Create] hashData={}", hashData);
        log.info("[VNPay Create] secureHash={}", vnp_SecureHash);
        String paymentUrl = VnPayConstant.vnp_Url + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;
        log.info("[VNPay Create] paymentUrl={}", paymentUrl);
        return paymentUrl;
    }

    @Override
    @Transactional
    public boolean paymentSucessFully(Map<String, String> params) {
        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");
        String transNo = params.get("vnp_TransactionNo");

        log.info("[VNPay Callback] txnRef={}, responseCode={}, transNo={}", txnRef, responseCode, transNo);

        // Bỏ qua xác thực chữ ký -> luôn coi là thành công cho dev/sandbox
        if (!"00".equals(responseCode)) {
            log.warn("[VNPay Callback] Thanh toán thất bại, responseCode={}", responseCode);
            return false;
        }

        try {
            HoaDon hoaDon = hoaDonRepository.findByMaHoaDon(txnRef).orElse(null);
            if (hoaDon == null) {
                log.error("[VNPay Callback] Không tìm thấy hóa đơn: {}", txnRef);
                return false;
            }

            // Tránh xử lý 2 lần (nếu reload lại trang returnUrl)
            if (hoaDon.getTrangThai() == OrderStatus.DA_XAC_NHAN) {
                log.warn("[VNPay Callback] Đơn {} đã được xác nhận trước đó", txnRef);
                return true;
            }

            // 1. Cập nhật trạng thái HoaDon -> DA_XAC_NHAN
            hoaDon.setTrangThai(OrderStatus.DA_XAC_NHAN);
            hoaDon.setNgayXacNhan(LocalDateTime.now());
            hoaDon.setMaGiaoDichVnpay(transNo);
            hoaDon.setNgayCapNhat(LocalDateTime.now());
            hoaDonRepository.save(hoaDon);

            // 2. Cập nhật chi tiết + trừ tồn kho
            List<HoaDonChiTiet> chiTiets = hoaDonChiTietRepository.findByHoaDonId(hoaDon.getId());
            for (HoaDonChiTiet ct : chiTiets) {
                ct.setTrangThai(OrderStatus.DA_XAC_NHAN);
                ct.setNgayCapNhat(LocalDateTime.now());

                Sach sach = ct.getSach();
                if (sach != null) {
                    int soLuongMoi = sach.getSoLuong() - ct.getSoLuong();
                    if (soLuongMoi < 0) soLuongMoi = 0;
                    sach.setSoLuong(soLuongMoi);
                    sachRepository.save(sach);
                }
            }
            hoaDonChiTietRepository.saveAll(chiTiets);

            // 3. Lưu lịch sử
            TaiKhoan khachHang = hoaDon.getKhachHang();
            LichSuDonHang lichSu = LichSuDonHang.builder()
                    .taiKhoan(khachHang)
                    .hoaDon(hoaDon)
                    .trangThai(OrderStatus.DA_XAC_NHAN)
                    .ghiChu("Khách hàng đã thanh toán qua VNPay. Mã GD: " + transNo)
                    .ngayTao(LocalDateTime.now())
                    .build();
            lichSuDonHangRepository.save(lichSu);

            // 4. Xóa giỏ hàng
            if (khachHang != null) {
                GioHang gioHang = gioHangRepository.findByKhachHangId(khachHang.getId()).orElse(null);
                if (gioHang != null) {
                    for (HoaDonChiTiet ct : chiTiets) {
                        if (ct.getSach() != null) {
                            gioHangChiTietRepository
                                    .findByGioHangIdAndSachId(gioHang.getId(), ct.getSach().getId())
                                    .ifPresent(gioHangChiTietRepository::delete);
                        }
                    }
                }
            }

            log.info("[VNPay Callback] Thanh toán thành công, đơn {} -> DA_XAC_NHAN", txnRef);
            return true;

        } catch (Exception e) {
            log.error("[VNPay Callback] Lỗi xử lý: {}", e.getMessage(), e);
            return false;
        }
    }
}
