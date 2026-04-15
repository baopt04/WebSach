package com.example.datn.service.impl;

import com.example.datn.dto.mail.OrderMailLine;
import com.example.datn.entity.HoaDon;
import com.example.datn.entity.HoaDonChiTiet;
import com.example.datn.entity.MaGiamGia;
import com.example.datn.entity.MaGiamGiaChiTiet;
import com.example.datn.enums.OrderStatus;
import com.example.datn.enums.PaymentMethod;
import com.example.datn.repository.HoaDonChiTietRepository;
import com.example.datn.repository.MaGiamGiaChiTietRepository;
import com.example.datn.service.HoaDonOrderMailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class HoaDonOrderMailServiceImpl implements HoaDonOrderMailService {

    private final JavaMailSender mailSender;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;
    private final MaGiamGiaChiTietRepository maGiamGiaChiTietRepository;

    @Value("${spring.mail.username}")
    private String fromUsername;

    @Value("${app.mail.shop-name:DREAM BOOK}")
    private String shopName;

    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter D = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static String money(BigDecimal v) {
        if (v == null) return "0";
        DecimalFormatSymbols sym = DecimalFormatSymbols.getInstance(new Locale("vi", "VN"));
        DecimalFormat df = new DecimalFormat("#,###", sym);
        return df.format(v) + " đ";
    }

    private static String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    private static boolean coEmailDeGui(String email) {
        if (email == null) {
            return false;
        }
        String t = email.trim();
        return !t.isEmpty() && t.contains("@");
    }

    private static String labelTrangThai(OrderStatus s) {
        if (s == null) return "";
        return switch (s) {
            case TAO_HOA_DON -> "Tạo hóa đơn";
            case CHO_XAC_NHAN -> "Chờ xác nhận";
            case DA_XAC_NHAN -> "Đã xác nhận";
            case DANG_CHUAN_BI_HANG -> "Đang chuẩn bị hàng";
            case DANG_GIAO -> "Đang giao";
            case DA_THANH_TOAN -> "Đã thanh toán";
            case THANH_CONG -> "Thành công";
            case DA_HUY -> "Đã hủy";
        };
    }

    private static String labelThanhToanEmail(PaymentMethod p) {
        if (p == null) return "—";
        return switch (p) {
            case TIEN_MAT -> "Thanh toán khi nhận hàng";
            case CHUYEN_KHOAN -> "Thanh toán VNPAY";
        };
    }

    private String buildHtml(HoaDon hd, List<OrderMailLine> lines, MaGiamGia voucher) {
        BigDecimal giam = hd.getGiamGia() != null ? hd.getGiamGia() : BigDecimal.ZERO;
        BigDecimal ship = hd.getPhiShip() != null ? hd.getPhiShip() : BigDecimal.ZERO;
        BigDecimal tongPhaiTra = hd.getTongTienHang().subtract(giam).add(ship);

        StringBuilder rows = new StringBuilder();
        int stt = 1;
        for (OrderMailLine ln : lines) {
            rows.append("<tr>")
                    .append("<td style=\"padding:8px;border:1px solid #ddd;text-align:center;width:40px;\">").append(stt++).append("</td>")
                    .append("<td style=\"padding:8px;border:1px solid #ddd;\">").append(esc(ln.tenSach())).append("</td>")
                    .append("<td style=\"padding:8px;border:1px solid #ddd;text-align:center;\">").append(ln.soLuong()).append("</td>")
                    .append("<td style=\"padding:8px;border:1px solid #ddd;text-align:right;\">").append(money(ln.donGia())).append("</td>")
                    .append("<td style=\"padding:8px;border:1px solid #ddd;text-align:right;\">").append(money(ln.thanhTien())).append("</td>")
                    .append("</tr>");
        }

        String voucherBlock = "";
        if (voucher != null && voucher.getMaVoucher() != null && !voucher.getMaVoucher().isBlank()) {
            voucherBlock = "<p style=\"margin:12px 0 0;font-size:14px;color:#333;\">Mã giảm giá: <strong>"
                    + esc(voucher.getMaVoucher()) + "</strong>"
                    + (voucher.getTenMaGiamGia() != null && !voucher.getTenMaGiamGia().isBlank()
                    ? " — " + esc(voucher.getTenMaGiamGia()) : "")
                    + "</p>";
        }

        String ngayNhanStr = hd.getNgayNhan() != null ? hd.getNgayNhan().format(D) : "—";
        String ghiChuBlock = (hd.getGhiChu() != null && !hd.getGhiChu().isBlank())
                ? "<p style=\"margin:8px 0 0;font-size:14px;\"><strong>Ghi chú:</strong> " + esc(hd.getGhiChu()) + "</p>"
                : "";

        String cellStyle = "padding:6px 0;font-size:14px;";
        String labelStyle = cellStyle + "color:#555;width:130px;vertical-align:top;";
        String valueStyle = cellStyle + "color:#333;";

        String blockDonHang = """
                <p style="margin:0 0 10px;font-size:14px;font-weight:600;">Thông tin đơn hàng</p>
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="__LABEL__">Mã hóa đơn</td><td style="__VALUE__"><strong>__MA_HO_DON__</strong></td></tr>
                  <tr><td style="__LABEL__">Thời gian đặt</td><td style="__VALUE__">__THOI_GIAN_DAT__</td></tr>
                  <tr><td style="__LABEL__">Trạng thái</td><td style="__VALUE__">__TRANG_THAI__</td></tr>
                  <tr><td style="__LABEL__">Thanh toán</td><td style="__VALUE__">__THANH_TOAN__</td></tr>
                </table>
                """.replace("__LABEL__", labelStyle).replace("__VALUE__", valueStyle);

        String blockNguoiNhan = """
                <p style="margin:0 0 10px;font-size:14px;font-weight:600;">Thông tin người nhận</p>
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="__LABEL__">Họ tên</td><td style="__VALUE__">__HO_TEN__</td></tr>
                  <tr><td style="__LABEL__">Số điện thoại</td><td style="__VALUE__">__SO_DT__</td></tr>
                  <tr><td style="__LABEL__">Địa chỉ giao hàng</td><td style="__VALUE__">__DIA_CHI__</td></tr>
                  <tr><td style="__LABEL__">Ngày nhận hàng</td><td style="__VALUE__">__NGAY_NHAN__</td></tr>
                </table>
                """.replace("__LABEL__", labelStyle).replace("__VALUE__", valueStyle);

        blockDonHang = blockDonHang
                .replace("__MA_HO_DON__", esc(hd.getMaHoaDon()))
                .replace("__THOI_GIAN_DAT__", esc(hd.getNgayTao() != null ? hd.getNgayTao().format(DT) : "—"))
                .replace("__TRANG_THAI__", esc(labelTrangThai(hd.getTrangThai())))
                .replace("__THANH_TOAN__", esc(labelThanhToanEmail(hd.getPhuongThuc())));

        blockNguoiNhan = blockNguoiNhan
                .replace("__HO_TEN__", esc(hd.getHoTen()))
                .replace("__SO_DT__", esc(hd.getSoDienThoai()))
                .replace("__DIA_CHI__", esc(hd.getDiaChiGiaoHang()))
                .replace("__NGAY_NHAN__", esc(ngayNhanStr));

        String tpl = """
                <!DOCTYPE html>
                <html lang="vi">
                <head><meta charset="UTF-8"></head>
                <body style="margin:0;padding:20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;line-height:1.55;background:#fff;">
                  <div style="max-width:640px;margin:0 auto;">
                    <p style="margin:0 0 4px;font-size:20px;font-weight:700;letter-spacing:0.5px;">__SHOP_NAME__</p>
                    <p style="margin:0 0 16px;font-size:14px;">Kính chào Quý khách,</p>
                    <p style="margin:0 0 16px;">Cảm ơn bạn đã đặt hàng. Chúng tôi gửi email này để xác nhận thông tin đơn hàng của bạn, giúp bạn đối chiếu nhanh chóng và yên tâm theo dõi đơn.</p>

                    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:50%;vertical-align:top;padding:0 16px 0 0;border-right:1px solid #e5e5e5;">
                          __BLOCK_DON_HANG__
                        </td>
                        <td style="width:50%;vertical-align:top;padding:0 0 0 16px;">
                          __BLOCK_NGUOI_NHAN__
                        </td>
                      </tr>
                    </table>

                    __GHI_CHU_BLOCK__

                    <p style="margin:20px 0 10px;font-size:14px;font-weight:600;">Thông tin sản phẩm đã đặt</p>
                    <table style="width:100%;border-collapse:collapse;font-size:13px;">
                      <thead>
                        <tr style="background:#f5f5f5;">
                          <th style="padding:8px;border:1px solid #ddd;text-align:center;font-weight:600;width:44px;">STT</th>
                          <th style="padding:8px;border:1px solid #ddd;text-align:left;font-weight:600;">Sản phẩm</th>
                          <th style="padding:8px;border:1px solid #ddd;text-align:center;font-weight:600;width:56px;">SL</th>
                          <th style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:600;width:100px;">Đơn giá</th>
                          <th style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:600;width:110px;">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>__ROWS__</tbody>
                    </table>

                    <table style="width:100%;max-width:320px;margin-top:16px;margin-left:auto;border-collapse:collapse;font-size:14px;">
                      <tr><td style="padding:4px 0;color:#555;">Tạm tính</td><td style="padding:4px 0;text-align:right;">__TAM_TINH__</td></tr>
                      <tr><td style="padding:4px 0;color:#555;">Giảm giá</td><td style="padding:4px 0;text-align:right;">__GIAM_GIA__</td></tr>
                      <tr><td style="padding:4px 0;color:#555;">Phí vận chuyển</td><td style="padding:4px 0;text-align:right;">__PHI_SHIP__</td></tr>
                      <tr><td style="padding:8px 0 0;font-weight:600;border-top:1px solid #ddd;">Tổng thanh toán</td><td style="padding:8px 0 0;text-align:right;font-weight:600;border-top:1px solid #ddd;">__TONG__</td></tr>
                    </table>

                    <p style="margin:28px 0 8px;font-size:14px;">Trân trọng cảm ơn bạn đã đặt hàng tại website của chúng tôi. Chúc bạn có một trải nghiệm mua sắm thật tốt.</p>
                    <p style="margin:0;font-size:13px;color:#666;">Đây là email tự động, vui lòng không trả lời trực tiếp.</p>
                  </div>
                </body>
                </html>
                """;
        return tpl
                .replace("__SHOP_NAME__", esc(shopName))
                .replace("__BLOCK_DON_HANG__", blockDonHang)
                .replace("__BLOCK_NGUOI_NHAN__", blockNguoiNhan)
                .replace("__VOUCHER_BLOCK__", voucherBlock)
                .replace("__GHI_CHU_BLOCK__", ghiChuBlock)
                .replace("__ROWS__", rows.toString())
                .replace("__TAM_TINH__", money(hd.getTongTienHang()))
                .replace("__GIAM_GIA__", money(giam))
                .replace("__PHI_SHIP__", money(ship))
                .replace("__TONG__", money(tongPhaiTra));
    }

    @Override
    @Transactional(readOnly = true)
    public void sendOrderPlacedEmailFromPersistedOrder(HoaDon hoaDon) {
        if (!coEmailDeGui(hoaDon.getEmail())) {
            return;
        }
        List<HoaDonChiTiet> chiTiets = hoaDonChiTietRepository.findByHoaDonIdFetchSach(hoaDon.getId());
        List<OrderMailLine> lines = new ArrayList<>();
        for (HoaDonChiTiet ct : chiTiets) {
            String ten = ct.getSach() != null && ct.getSach().getTenSach() != null
                    ? ct.getSach().getTenSach()
                    : "Sản phẩm";
            BigDecimal dg = ct.getDonGia() != null ? ct.getDonGia() : BigDecimal.ZERO;
            int sl = ct.getSoLuong() != null ? ct.getSoLuong() : 0;
            lines.add(new OrderMailLine(ten, sl, dg, dg.multiply(BigDecimal.valueOf(sl))));
        }
        MaGiamGia voucher = maGiamGiaChiTietRepository.findFirstByHoaDon_Id(hoaDon.getId())
                .map(MaGiamGiaChiTiet::getMaGiamGia)
                .orElse(null);
        sendOrderPlacedEmail(hoaDon, lines, voucher);
    }

    @Override
    public void sendOrderPlacedEmail(HoaDon hoaDon, List<OrderMailLine> lines, MaGiamGia maGiamGiaOrNull) {
        if (!coEmailDeGui(hoaDon.getEmail())) {
            return;
        }
        String to = hoaDon.getEmail().trim();
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromUsername);
            helper.setTo(to);
            helper.setSubject("Xác nhận đơn hàng " + hoaDon.getMaHoaDon());
            helper.setText(buildHtml(hoaDon, lines, maGiamGiaOrNull), true);
            mailSender.send(message);
            log.info("Đã gửi email xác nhận đơn {} tới {}", hoaDon.getMaHoaDon(), to.trim());
        } catch (Exception e) {
            log.warn("Không gửi được email xác nhận đơn {}: {}", hoaDon.getMaHoaDon(), e.getMessage());
        }
    }
}
