package com.example.datn.service.impl;

import com.example.datn.dto.request.PosQuayGiamSoLuongRequest;
import com.example.datn.dto.request.PosQuayKhachHangNhanhRequest;
import com.example.datn.dto.request.PosQuayThanhToanRequest;
import com.example.datn.dto.request.PosQuayThemSachRequest;
import com.example.datn.dto.response.HoaDonChiTietResponse;
import com.example.datn.dto.response.HoaDonDetailResponse;
import com.example.datn.dto.response.HoaDonResponse;
import com.example.datn.dto.response.LichSuDonHangResponse;
import com.example.datn.dto.response.PosQuayHoaDonSummaryResponse;
import com.example.datn.dto.response.PosQuayKhachHangLienHeResponse;
import com.example.datn.dto.response.SachResponse;
import com.example.datn.entity.HoaDon;
import com.example.datn.entity.HoaDonChiTiet;
import com.example.datn.entity.LichSuDonHang;
import com.example.datn.entity.MaGiamGia;
import com.example.datn.entity.MaGiamGiaChiTiet;
import com.example.datn.entity.Sach;
import com.example.datn.entity.SachHinhAnh;
import com.example.datn.entity.TaiKhoan;
import com.example.datn.enums.AccountStatus;
import com.example.datn.enums.OrderStatus;
import com.example.datn.enums.PaymentMethod;
import com.example.datn.enums.Role;
import com.example.datn.enums.TypeBill;
import com.example.datn.enums.VoucherStatus;
import com.example.datn.enums.VoucherType;
import com.example.datn.exception.AppException;
import com.example.datn.repository.HoaDonChiTietRepository;
import com.example.datn.repository.HoaDonRepository;
import com.example.datn.repository.LichSuDonHangRepository;
import com.example.datn.repository.MaGiamGiaChiTietRepository;
import com.example.datn.repository.MaGiamGiaRepository;
import com.example.datn.repository.SachHinhAnhRepository;
import com.example.datn.repository.SachRepository;
import com.example.datn.repository.TaiKhoanRepository;
import com.example.datn.service.HoaDonOrderMailService;
import com.example.datn.service.PosQuayBanHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PosQuayBanHangServiceImpl implements PosQuayBanHangService {

    private final HoaDonRepository hoaDonRepository;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;
    private final LichSuDonHangRepository lichSuDonHangRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final SachRepository sachRepository;
    private final SachHinhAnhRepository sachHinhAnhRepository;
    private final MaGiamGiaRepository maGiamGiaRepository;
    private final MaGiamGiaChiTietRepository maGiamGiaChiTietRepository;
    private final HoaDonOrderMailService hoaDonOrderMailService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<PosQuayHoaDonSummaryResponse> listHoaDonTrangThaiTaoHoaDon() {
        return hoaDonRepository.findByTrangThaiOrderByNgayCapNhatDesc(OrderStatus.TAO_HOA_DON).stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HoaDonDetailResponse taoHoaDonTrong() {
        TaiKhoan nhanVien = getCurrentTaiKhoanOrThrow();
        LocalDateTime now = LocalDateTime.now();
        String maHoaDon = "HD" + String.format("%05d", new Random().nextInt(100000));

        HoaDon hoaDon = HoaDon.builder()
                .nhanVien(nhanVien)
                .maHoaDon(maHoaDon)
                .trangThai(OrderStatus.TAO_HOA_DON)
                .loaiHoaDon(TypeBill.OFFLINE)
                .phuongThuc(PaymentMethod.TIEN_MAT)
                .phiShip(BigDecimal.ZERO)
                .tongTienHang(BigDecimal.ZERO)
                .giamGia(BigDecimal.ZERO)
                .ngayTao(now)
                .ngayCapNhat(now)
                .build();

        hoaDon = hoaDonRepository.save(hoaDon);

        lichSuDonHangRepository.save(LichSuDonHang.builder()
                .taiKhoan(nhanVien)
                .hoaDon(hoaDon)
                .trangThai(OrderStatus.TAO_HOA_DON)
                .ghiChu("Hóa đơn bán hàng tại quầy")
                .ngayTao(now)
                .build());

        return buildChiTiet(hoaDon.getId());
    }

    @Override
    public List<PosQuayKhachHangLienHeResponse> listKhachHangLienHe() {
        return taiKhoanRepository.findByVaiTroOrderByNgayCapNhatDesc(Role.ROLE_CUSTOMER).stream()
                .map(t -> PosQuayKhachHangLienHeResponse.builder()
                        .id(t.getId())
                        .hoTen(t.getHoTen())
                        .soDienThoai(t.getSoDienThoai())
                        .email(t.getEmail())
                        .ngayCapNhat(t.getNgayCapNhat())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PosQuayKhachHangLienHeResponse taoKhachHangNhanh(PosQuayKhachHangNhanhRequest request) {
        String sdt = request.getSoDienThoai().trim();
        if (taiKhoanRepository.existsBySoDienThoai(sdt)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Số điện thoại đã được đăng ký");
        }


        String maTk = "TK" + String.format("%05d", new Random().nextInt(100000));
        LocalDateTime now = LocalDateTime.now();

        TaiKhoan tk = TaiKhoan.builder()
                .maTaiKhoan(maTk)

                .matKhau(passwordEncoder.encode(UUID.randomUUID().toString()))
                .hoTen(request.getHoTen().trim())
                .soDienThoai(sdt)
                .vaiTro(Role.ROLE_CUSTOMER)
                .trangThai(AccountStatus.ACTIVATED)
                .ngayTao(now)
                .ngayCapNhat(now)
                .build();

        TaiKhoan saved = taiKhoanRepository.save(tk);
        return PosQuayKhachHangLienHeResponse.builder()
                .id(saved.getId())
                .hoTen(saved.getHoTen())
                .soDienThoai(saved.getSoDienThoai())
                .email(saved.getEmail())
                .build();
    }

    @Override
    @Transactional
    public HoaDonDetailResponse themSachVaoHoaDon(Integer idHoaDon, PosQuayThemSachRequest request) {
        TaiKhoan nhanVien = getCurrentTaiKhoanOrThrow();
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn"));
        assertHoaDonQuayHopLe(hoaDon, nhanVien);

        Sach sach = sachRepository.findById(request.getIdSach())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy sách"));
        if (Boolean.FALSE.equals(sach.getTrangThai())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Sách không còn được bán");
        }
        int ton = sach.getSoLuong() != null ? sach.getSoLuong() : 0;
        if (ton < request.getSoLuong()) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Không đủ tồn kho cho \"" + sach.getTenSach() + "\" (còn " + ton + ")");
        }

        BigDecimal giaBan = sach.getGiaBan() != null ? sach.getGiaBan() : BigDecimal.ZERO;
        LocalDateTime now = LocalDateTime.now();
        int soLuongThem = request.getSoLuong();
        int tonMoi = ton - soLuongThem;
        sach.setSoLuong(tonMoi);
        if (tonMoi == 0) {
            sach.setTrangThai(false);
        }
        sachRepository.save(sach);

        Optional<HoaDonChiTiet> existingOpt = hoaDonChiTietRepository.findByHoaDon_IdAndSach_Id(idHoaDon, sach.getId());
        if (existingOpt.isPresent()) {
            HoaDonChiTiet ct = existingOpt.get();
            int oldQty = ct.getSoLuong() != null ? ct.getSoLuong() : 0;
            BigDecimal oldLine = ct.getDonGia().multiply(BigDecimal.valueOf(oldQty));
            BigDecimal themLine = giaBan.multiply(BigDecimal.valueOf(soLuongThem));
            int newQty = oldQty + soLuongThem;
            ct.setSoLuong(newQty);
            ct.setDonGia(oldLine.add(themLine).divide(BigDecimal.valueOf(newQty), 2, RoundingMode.HALF_UP));
            ct.setNgayCapNhat(now);
            hoaDonChiTietRepository.save(ct);
        } else {
            HoaDonChiTiet chiTiet = HoaDonChiTiet.builder()
                    .hoaDon(hoaDon)
                    .sach(sach)
                    .soLuong(soLuongThem)
                    .donGia(giaBan)
                    .trangThai(OrderStatus.TAO_HOA_DON)
                    .ngayTao(now)
                    .ngayCapNhat(now)
                    .build();
            hoaDonChiTietRepository.save(chiTiet);
        }

        recalcTongTienHang(hoaDon);
        return buildChiTiet(idHoaDon);
    }

    @Override
    @Transactional
    public HoaDonDetailResponse xoaChiTietKhoiHoaDon(Integer idHoaDon, Integer idChiTiet) {
        TaiKhoan nhanVien = getCurrentTaiKhoanOrThrow();
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn"));
        assertHoaDonQuayHopLe(hoaDon, nhanVien);

        HoaDonChiTiet ct = hoaDonChiTietRepository.findById(idChiTiet)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy dòng chi tiết"));
        if (ct.getHoaDon() == null || !ct.getHoaDon().getId().equals(idHoaDon)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Dòng chi tiết không thuộc hóa đơn này");
        }

        Sach sach = ct.getSach();
        int qty = ct.getSoLuong() != null ? ct.getSoLuong() : 0;
        if (sach != null && qty > 0) {
            int ton = sach.getSoLuong() != null ? sach.getSoLuong() : 0;
            int restored = ton + qty;
            sach.setSoLuong(restored);
            if (restored > 0) {
                sach.setTrangThai(true);
            }
            sachRepository.save(sach);
        }

        hoaDonChiTietRepository.delete(ct);
        recalcTongTienHang(hoaDon);
        return buildChiTiet(idHoaDon);
    }

    @Override
    @Transactional
    public HoaDonDetailResponse giamSoLuongChiTiet(Integer idHoaDon, Integer idChiTiet, PosQuayGiamSoLuongRequest request) {
        TaiKhoan nhanVien = getCurrentTaiKhoanOrThrow();
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn"));
        assertHoaDonQuayHopLe(hoaDon, nhanVien);

        HoaDonChiTiet ct = hoaDonChiTietRepository.findById(idChiTiet)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy dòng chi tiết"));
        if (ct.getHoaDon() == null || !ct.getHoaDon().getId().equals(idHoaDon)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Dòng chi tiết không thuộc hóa đơn này");
        }

        int giam = request.getSoLuongGiam();
        int oldQty = ct.getSoLuong() != null ? ct.getSoLuong() : 0;
        if (oldQty < giam) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Số lượng trong hóa đơn chỉ còn " + oldQty + ", không thể giảm " + giam);
        }

        Sach sach = ct.getSach();
        if (sach != null && giam > 0) {
            int ton = sach.getSoLuong() != null ? sach.getSoLuong() : 0;
            int restored = ton + giam;
            sach.setSoLuong(restored);
            if (restored > 0) {
                sach.setTrangThai(true);
            }
            sachRepository.save(sach);
        }

        int newQty = oldQty - giam;
        LocalDateTime now = LocalDateTime.now();
        if (newQty <= 0) {
            hoaDonChiTietRepository.delete(ct);
        } else {
            ct.setSoLuong(newQty);
            ct.setNgayCapNhat(now);
            hoaDonChiTietRepository.save(ct);
        }

        recalcTongTienHang(hoaDon);
        return buildChiTiet(idHoaDon);
    }

    @Override
    @Transactional(readOnly = true)
    public SachResponse timSachTheoMaVach(String maVach) {
        if (maVach == null || maVach.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mã vạch không được để trống");
        }
        Sach sach = sachRepository.findFirstByMaVach(maVach.trim())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy sách với mã vạch này"));
        return mapSachToResponse(sach);
    }

    @Override
    @Transactional
    public HoaDonDetailResponse thanhToan(Integer idHoaDon, PosQuayThanhToanRequest request) {
        TaiKhoan nhanVien = getCurrentTaiKhoanOrThrow();
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn"));
        assertHoaDonQuayHopLe(hoaDon, nhanVien);

        List<HoaDonChiTiet> chiTiets = hoaDonChiTietRepository.findByHoaDonId(idHoaDon);
        if (chiTiets == null || chiTiets.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Hóa đơn chưa có sản phẩm");
        }

        if (request.getIdKhachHang() != null) {
            TaiKhoan kh = taiKhoanRepository.findById(request.getIdKhachHang())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));
            hoaDon.setKhachHang(kh);
        }
        if (request.getHoTen() != null && !request.getHoTen().isBlank()) {
            hoaDon.setHoTen(request.getHoTen().trim());
        }
        if (request.getSoDienThoai() != null && !request.getSoDienThoai().isBlank()) {
            hoaDon.setSoDienThoai(request.getSoDienThoai().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            hoaDon.setEmail(request.getEmail().trim());
        }

        if (isGiaoHang(request)) {
            if (request.getDiaChiGiaoHang() == null || request.getDiaChiGiaoHang().isBlank()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Giao hàng cần địa chỉ chi tiết (diaChiGiaoHang)");
            }
            if (request.getNgayNhan() == null) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Giao hàng cần ngày nhận (ngayNhan)");
            }
            BigDecimal phi = request.getPhiShip() != null ? request.getPhiShip() : BigDecimal.ZERO;
            if (phi.compareTo(BigDecimal.ZERO) < 0) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Phí ship không được âm");
            }
            phi = phi.divide(BigDecimal.valueOf(10000), 0, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(10000));
            hoaDon.setDiaChiGiaoHang(request.getDiaChiGiaoHang().trim());
            hoaDon.setPhiShip(phi);
            hoaDon.setNgayNhan(request.getNgayNhan());
        } else {
            hoaDon.setDiaChiGiaoHang(null);
            hoaDon.setPhiShip(BigDecimal.ZERO);
            hoaDon.setNgayNhan(null);
        }

        recalcTongTienHang(hoaDon);
        BigDecimal tongTienHang = hoaDon.getTongTienHang() != null ? hoaDon.getTongTienHang() : BigDecimal.ZERO;

        LocalDateTime now = LocalDateTime.now();
        String maVoucherRaw = request.getMaVoucher();

        if (maVoucherRaw != null && !maVoucherRaw.isBlank()) {
            MaGiamGia voucher = maGiamGiaRepository.findFirstByMaVoucherIgnoreCase(maVoucherRaw.trim())
                    .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Không tìm thấy mã voucher"));
            assertVoucherHopLe(voucher, tongTienHang, now);
            if (maGiamGiaChiTietRepository.findFirstByHoaDon_Id(idHoaDon).isPresent()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Hóa đơn đã gắn voucher");
            }
            BigDecimal giamMacDinh = tinhSoTienGiamVoucher(voucher, tongTienHang);
            BigDecimal giam = resolveSoTienGiamThucTe(request, voucher, tongTienHang, giamMacDinh);
            hoaDon.setGiamGia(giam);

            MaGiamGiaChiTiet mgct = MaGiamGiaChiTiet.builder()
                    .hoaDon(hoaDon)
                    .maGiamGia(voucher)
                    .tienTruocKhiGiam(tongTienHang)
                    .soTienGiam(giam)
                    .tienSauKhiGiam(tongTienHang.subtract(giam))
                    .ngayTao(now)
                    .ngayCapNhat(now)
                    .build();
            maGiamGiaChiTietRepository.save(mgct);

            if (voucher.getSoLuong() != null && voucher.getSoLuong() > 0) {
                voucher.setSoLuong(voucher.getSoLuong() - 1);
                if (voucher.getSoLuong() == 0) {
                    voucher.setTrangThai(VoucherStatus.NGUNG_HOAT_DONG);
                }
                maGiamGiaRepository.save(voucher);
            }
        } else {
            hoaDon.setGiamGia(BigDecimal.ZERO);
        }

        PaymentMethod pm = request.getPhuongThucThanhToan() != null
                ? request.getPhuongThucThanhToan()
                : PaymentMethod.TIEN_MAT;

        boolean giaoHang = isGiaoHang(request);
        OrderStatus trangThaiSauThanhToan = giaoHang ? OrderStatus.CHO_XAC_NHAN : OrderStatus.THANH_CONG;

        hoaDon.setTrangThai(trangThaiSauThanhToan);
        hoaDon.setPhuongThuc(pm);
        hoaDon.setNgayCapNhat(now);
        hoaDon.setNgayGiaoThanhCong(giaoHang ? null : now);
        if (request.getGhiChu() != null && !request.getGhiChu().isBlank()) {
            String old = hoaDon.getGhiChu();
            if (old == null || old.isBlank()) {
                hoaDon.setGhiChu(request.getGhiChu());
            } else {
                hoaDon.setGhiChu(old + " | Thanh toán: " + request.getGhiChu());
            }
        }
        hoaDonRepository.save(hoaDon);

        for (HoaDonChiTiet ct : chiTiets) {
            ct.setTrangThai(trangThaiSauThanhToan);
            ct.setNgayCapNhat(now);
        }
        hoaDonChiTietRepository.saveAll(chiTiets);

        String ghiChuLs = "Thanh toán tại quầy (POS)";
        if (giaoHang) {
            ghiChuLs = ghiChuLs + " — Giao hàng";
            LocalDate nn = request.getNgayNhan();
            if (nn != null) {
                ghiChuLs = ghiChuLs + ", ngày nhận: " + nn;
            }
        }
        if (maVoucherRaw != null && !maVoucherRaw.isBlank()) {
            ghiChuLs = ghiChuLs + " — Voucher: " + maVoucherRaw.trim();
        }
        if (request.getGhiChu() != null && !request.getGhiChu().isBlank()) {
            ghiChuLs = ghiChuLs + " — " + request.getGhiChu();
        }
        lichSuDonHangRepository.save(LichSuDonHang.builder()
                .taiKhoan(nhanVien)
                .hoaDon(hoaDon)
                .trangThai(trangThaiSauThanhToan)
                .ghiChu(ghiChuLs)
                .ngayTao(now)
                .build());

        // Chi gui mail khi hoa don co email hop le (service tu bo qua neu email rong/khong hop le)
        hoaDonOrderMailService.sendOrderPlacedEmailFromPersistedOrder(hoaDon);

        return buildChiTiet(idHoaDon);
    }

    private void assertVoucherHopLe(MaGiamGia m, BigDecimal tongTienHang, LocalDateTime now) {
        if (m.getTrangThai() != VoucherStatus.HOAT_DONG) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Voucher không còn hiệu lực");
        }
        if (m.getSoLuong() == null || m.getSoLuong() <= 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Voucher đã hết lượt sử dụng");
        }
        if (m.getNgayBatDau() != null && now.isBefore(m.getNgayBatDau())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Voucher chưa đến thời gian áp dụng");
        }
        if (m.getNgayKetThuc() != null && now.isAfter(m.getNgayKetThuc())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Voucher đã hết hạn");
        }
        if (m.getTienToiThieu() != null && tongTienHang.compareTo(m.getTienToiThieu()) < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Đơn hàng chưa đạt giá trị tối thiểu để dùng voucher (tối thiểu: " + m.getTienToiThieu() + ")");
        }
    }

    private BigDecimal tinhSoTienGiamVoucher(MaGiamGia voucher, BigDecimal tongTienHang) {
        BigDecimal tong = tongTienHang != null ? tongTienHang : BigDecimal.ZERO;
        BigDecimal giaTriGiam = voucher.getGiaTriGiam() != null ? voucher.getGiaTriGiam() : BigDecimal.ZERO;

        BigDecimal giam;
        if (voucher.getVoucherType() == VoucherType.GIAM_THEO_PHAN_TRAM) {
            giam = tong.multiply(giaTriGiam).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal giamToiDa = voucher.getGiamToiDa();
            if (giamToiDa != null && giamToiDa.compareTo(BigDecimal.ZERO) >= 0 && giam.compareTo(giamToiDa) > 0) {
                giam = giamToiDa;
            }
        } else {
            giam = giaTriGiam;
        }

        if (giam.compareTo(BigDecimal.ZERO) < 0) {
            giam = BigDecimal.ZERO;
        }
        if (giam.compareTo(tong) > 0) {
            giam = tong;
        }
        return giam;
    }

    private BigDecimal resolveSoTienGiamThucTe(
            PosQuayThanhToanRequest request,
            MaGiamGia voucher,
            BigDecimal tongTienHang,
            BigDecimal giamMacDinh
    ) {
        if (request == null || request.getSoTienGiamVoucher() == null) {
            return giamMacDinh;
        }

        BigDecimal giamTuClient = request.getSoTienGiamVoucher();
        if (giamTuClient.compareTo(BigDecimal.ZERO) < 0) {
            giamTuClient = BigDecimal.ZERO;
        }

        BigDecimal gioiHan = giamMacDinh;
        if (voucher.getVoucherType() == VoucherType.GIAM_THEO_PHAN_TRAM) {
            BigDecimal giamToiDa = voucher.getGiamToiDa();
            if (giamToiDa != null && giamToiDa.compareTo(BigDecimal.ZERO) > 0) {
                gioiHan = giamToiDa;
            }
        }

        if (gioiHan == null || gioiHan.compareTo(BigDecimal.ZERO) < 0) {
            gioiHan = BigDecimal.ZERO;
        }

        BigDecimal giamHopLe = giamTuClient.min(gioiHan).min(tongTienHang);
        if (giamHopLe.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }
        return giamHopLe.setScale(2, RoundingMode.HALF_UP);
    }

    private SachResponse mapSachToResponse(Sach sach) {
        List<SachHinhAnh> dsAnh = sachHinhAnhRepository.findBySachId(sach.getId());
        String duongDanAnh = sachHinhAnhRepository.findFirstBySach_IdAndLaAnhChinhTrue(sach.getId())
                .map(SachHinhAnh::getDuongDan)
                .orElse(null);
        List<String> hinhAnhs = dsAnh.stream()
                .map(SachHinhAnh::getDuongDan)
                .toList();
        Integer idTl = sach.getTheLoai() != null ? sach.getTheLoai().getId() : null;
        String tenTl = sach.getTheLoai() != null ? sach.getTheLoai().getTenTheLoai() : null;
        Integer idNxb = sach.getNhaXuatBan() != null ? sach.getNhaXuatBan().getId() : null;
        String tenNxb = sach.getNhaXuatBan() != null ? sach.getNhaXuatBan().getTenNxb() : null;
        return SachResponse.builder()
                .id(sach.getId())
                .maSach(sach.getMaSach())
                .maVach(sach.getMaVach())
                .tenSach(sach.getTenSach())
                .giaBan(sach.getGiaBan())
                .soLuong(sach.getSoLuong())
                .soTrang(sach.getSoTrang())
                .ngonNgu(sach.getNgonNgu())
                .namXuatBan(sach.getNamXuatBan())
                .kichThuoc(sach.getKichThuoc())
                .moTa(sach.getMoTa())
                .idTheLoai(idTl)
                .idNxb(idNxb)
                .tenTheLoai(tenTl)
                .tenNxb(tenNxb)
                .duongDanAnh(duongDanAnh)
                .hinhAnhs(hinhAnhs)
                .trangThai(sach.getTrangThai())
                .ngayCapNhat(sach.getNgayCapNhat())
                .build();
    }

    private static boolean isGiaoHang(PosQuayThanhToanRequest request) {
        if (request == null || request.getHinhThucNhanHang() == null) {
            return false;
        }
        return "GIAO_HANG".equalsIgnoreCase(request.getHinhThucNhanHang().trim());
    }

    private void assertHoaDonQuayHopLe(HoaDon h, TaiKhoan nhanVien) {
        if (h.getLoaiHoaDon() != TypeBill.OFFLINE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ áp dụng cho hóa đơn bán tại quầy (OFFLINE)");
        }
        if (h.getTrangThai() != OrderStatus.TAO_HOA_DON) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ thao tác khi hóa đơn đang ở trạng thái TAO_HOA_DON");
        }
        if (h.getNhanVien() == null || !h.getNhanVien().getId().equals(nhanVien.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không phải nhân viên tạo hóa đơn này");
        }
    }

    private void recalcTongTienHang(HoaDon hoaDon) {
        List<HoaDonChiTiet> list = hoaDonChiTietRepository.findByHoaDonId(hoaDon.getId());
        BigDecimal sum = list.stream()
                .map(ct -> ct.getDonGia().multiply(BigDecimal.valueOf(ct.getSoLuong())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        hoaDon.setTongTienHang(sum);
        hoaDon.setNgayCapNhat(LocalDateTime.now());
        hoaDonRepository.save(hoaDon);
    }

    private PosQuayHoaDonSummaryResponse toSummary(HoaDon hd) {
        return PosQuayHoaDonSummaryResponse.builder()
                .id(hd.getId())
                .maHoaDon(hd.getMaHoaDon())
                .hoTen(hd.getHoTen())
                .soDienThoai(hd.getSoDienThoai())
                .email(hd.getEmail())
                .tongTienHang(hd.getTongTienHang())
                .trangThai(hd.getTrangThai())
                .loaiHoaDon(hd.getLoaiHoaDon())
                .ngayTao(hd.getNgayTao())
                .ngayCapNhat(hd.getNgayCapNhat())
                .chiTiets(mapChiTiets(hd.getId()))
                .build();
    }

    private List<HoaDonChiTietResponse> mapChiTiets(Integer idHoaDon) {
        List<HoaDonChiTiet> chiTiets = hoaDonChiTietRepository.findByHoaDonIdFetchSach(idHoaDon);
        return chiTiets.stream().map(ct -> {
            String urlHinhAnh = null;
            if (ct.getSach() != null) {
                List<SachHinhAnh> hinhAnhs = sachHinhAnhRepository.findBySachId(ct.getSach().getId());
                if (hinhAnhs != null && !hinhAnhs.isEmpty()) {
                    urlHinhAnh = hinhAnhs.stream()
                            .filter(img -> Boolean.TRUE.equals(img.getLaAnhChinh()))
                            .findFirst()
                            .map(SachHinhAnh::getDuongDan)
                            .orElse(hinhAnhs.get(0).getDuongDan());
                }
            }
            return HoaDonChiTietResponse.builder()
                    .id(ct.getId())
                    .idHoaDon(ct.getHoaDon() != null ? ct.getHoaDon().getId() : idHoaDon)
                    .idSach(ct.getSach() != null ? ct.getSach().getId() : null)
                    .maSach(ct.getSach() != null ? ct.getSach().getMaSach() : null)
                    .tenSach(ct.getSach() != null ? ct.getSach().getTenSach() : null)
                    .hinhAnh(urlHinhAnh)
                    .soLuong(ct.getSoLuong())
                    .donGia(ct.getDonGia())
                    .trangThai(ct.getTrangThai())
                    .build();
        }).collect(Collectors.toList());
    }

    private HoaDonDetailResponse buildChiTiet(Integer idHoaDon) {
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn"));

        HoaDonResponse hdResponse = HoaDonResponse.builder()
                .id(hoaDon.getId())
                .maHoaDon(hoaDon.getMaHoaDon())
                .hoTenKhachHang(hoaDon.getHoTen())
                .soDienThoai(hoaDon.getSoDienThoai())
                .email(hoaDon.getEmail())
                .diaChiGiaoHang(hoaDon.getDiaChiGiaoHang())
                .tongTienHang(hoaDon.getTongTienHang())
                .phiShip(hoaDon.getPhiShip())
                .giamGia(hoaDon.getGiamGia())
                .trangThai(hoaDon.getTrangThai())
                .phuongThuc(hoaDon.getPhuongThuc())
                .loaiHoaDon(hoaDon.getLoaiHoaDon())
                .ngayNhan(hoaDon.getNgayNhan())
                .ghiChu(hoaDon.getGhiChu())
                .ngayTao(hoaDon.getNgayTao())
                .ngayCapNhat(hoaDon.getNgayCapNhat())
                .build();

        List<HoaDonChiTietResponse> ctResponses = mapChiTiets(idHoaDon);

        List<LichSuDonHang> lichSuList = lichSuDonHangRepository.findByHoaDonIdOrderByNgayTaoDesc(idHoaDon);
        List<LichSuDonHangResponse> lichSuResponses = lichSuList.stream().map(ls -> LichSuDonHangResponse.builder()
                .id(ls.getId())
                .idHoaDon(ls.getHoaDon().getId())
                .tenNhanVien(ls.getTaiKhoan() != null ? ls.getTaiKhoan().getHoTen() : null)
                .trangThai(ls.getTrangThai())
                .ghiChu(ls.getGhiChu())
                .ngayTao(ls.getNgayTao())
                .build()).collect(Collectors.toList());

        return HoaDonDetailResponse.builder()
                .hoaDon(hdResponse)
                .chiTiets(ctResponses)
                .lichSuDonHang(lichSuResponses)
                .build();
    }

    private TaiKhoan getCurrentTaiKhoanOrThrow() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }
        String email = auth.getName();
        return taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Không tìm thấy tài khoản"));
    }
}
