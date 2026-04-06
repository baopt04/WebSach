package com.example.datn.dto.request;

import com.example.datn.enums.PaymentMethod;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Thanh toán POS: cập nhật thông tin hóa đơn (khách), áp dụng voucher (nếu có), chuyển THANH_CONG.
 * Chỉ khi {@code hinhThucNhanHang} là {@code "GIAO_HANG"} (không phân biệt hoa thường) mới lưu địa chỉ / phí ship / ngày nhận.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosQuayThanhToanRequest {

    private PaymentMethod phuongThucThanhToan;

    private String ghiChu;

    /**
     * {@code "GIAO_HANG"}: bắt buộc gửi kèm địa chỉ, phí ship, ngày nhận.
     * Khác hoặc để trống: không lưu thông tin giao hàng (xóa các trường tương ứng trên hóa đơn).
     */
    private String hinhThucNhanHang;

    /** Địa chỉ giao hàng chi tiết — chỉ dùng khi {@code hinhThucNhanHang == GIAO_HANG} */
    private String diaChiGiaoHang;

    /** Phí ship — chỉ dùng khi giao hàng; nếu null khi giao hàng thì coi là 0 */
    private BigDecimal phiShip;

    /** Ngày dự kiến nhận — chỉ dùng khi giao hàng */
    private LocalDate ngayNhan;

    /** Mã voucher (maVoucher) — tùy chọn */
    private String maVoucher;

    /** Gắn khách có tài khoản — tùy chọn */
    private Integer idKhachHang;

    /** Snapshot khách lên hóa đơn — tùy chọn */
    private String hoTen;
    private String soDienThoai;
    private String email;
}
