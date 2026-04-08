package com.example.datn.service.impl;


import com.example.datn.dto.mail.OrderMailLine;
import com.example.datn.dto.request.HoaDonChiTietRequest;
import com.example.datn.dto.request.HoaDonCreateRequest;
import com.example.datn.dto.request.HoaDonUpdateRequest;
import com.example.datn.dto.request.PosHoaDonCreateRequest;
import com.example.datn.dto.request.PosHoaDonThemHangRequest;
import com.example.datn.dto.request.TrangThaiHoaDonRequest;
import com.example.datn.dto.response.HoaDonChiTietResponse;
import com.example.datn.dto.response.HoaDonDetailResponse;
import com.example.datn.dto.response.HoaDonResponse;
import com.example.datn.dto.response.LichSuDonHangResponse;
import com.example.datn.entity.GioHang;
import com.example.datn.entity.HoaDon;
import com.example.datn.entity.HoaDonChiTiet;
import com.example.datn.entity.LichSuDonHang;
import com.example.datn.entity.MaGiamGia;
import com.example.datn.entity.MaGiamGiaChiTiet;
import com.example.datn.entity.Sach;
import com.example.datn.entity.SachHinhAnh;
import com.example.datn.entity.TaiKhoan;
import com.example.datn.enums.OrderStatus;
import com.example.datn.enums.PaymentMethod;
import com.example.datn.enums.TypeBill;
import com.example.datn.enums.VoucherStatus;
import com.example.datn.enums.VoucherType;
import com.example.datn.repository.GioHangChiTietRepository;
import com.example.datn.repository.GioHangRepository;
import com.example.datn.repository.HoaDonChiTietRepository;
import com.example.datn.repository.HoaDonRepository;
import com.example.datn.repository.LichSuDonHangRepository;
import com.example.datn.repository.MaGiamGiaChiTietRepository;
import com.example.datn.repository.MaGiamGiaRepository;
import com.example.datn.repository.SachHinhAnhRepository;
import com.example.datn.repository.SachRepository;
import com.example.datn.repository.TaiKhoanRepository;
import com.example.datn.exception.AppException;
import com.example.datn.service.HoaDonOrderMailService;
import com.example.datn.service.HoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HoaDonServiceImpl implements HoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;
    private final LichSuDonHangRepository lichSuDonHangRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final SachRepository sachRepository;
    private final SachHinhAnhRepository sachHinhAnhRepository;
    private final MaGiamGiaRepository maGiamGiaRepository;
    private final MaGiamGiaChiTietRepository maGiamGiaChiTietRepository;
    private final GioHangRepository gioHangRepository;
    private final GioHangChiTietRepository gioHangChiTietRepository;
    private final HoaDonOrderMailService hoaDonOrderMailService;

    @Override
    public List<HoaDonResponse> getAllHoaDon() {
        List<HoaDon> hoaDons = hoaDonRepository.findAllByOrderByNgayCapNhatDesc();
        return hoaDons.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private HoaDonResponse mapToResponse(HoaDon hd) {
        return HoaDonResponse.builder()
                .id(hd.getId())
                .maHoaDon(hd.getMaHoaDon())
                .hoTenKhachHang(hd.getHoTen())
                .soDienThoai(hd.getSoDienThoai())
                .email(hd.getEmail())
                .diaChiGiaoHang(hd.getDiaChiGiaoHang())
                .tongTienHang(hd.getTongTienHang())
                .phiShip(hd.getPhiShip())
                .giamGia(hd.getGiamGia())
                .trangThai(hd.getTrangThai())
                .phuongThuc(hd.getPhuongThuc())
                .loaiHoaDon(hd.getLoaiHoaDon())
                .ghiChu(hd.getGhiChu())
                .ngayTao(hd.getNgayTao())
                .ngayCapNhat(hd.getNgayCapNhat())
                .build();
    }

    @Override
    public HoaDonDetailResponse getHoaDonChiTietByHoaDonId(Integer idHoaDon) {
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));

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

        List<HoaDonChiTiet> chiTiets = hoaDonChiTietRepository.findByHoaDonId(idHoaDon);
        List<HoaDonChiTietResponse> ctResponses = chiTiets.stream().map(ct -> {
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
                    .idHoaDon(ct.getHoaDon().getId())
                    .idSach(ct.getSach() != null ? ct.getSach().getId() : null)
                    .maSach(ct.getSach() != null ? ct.getSach().getMaSach() : null)
                    .tenSach(ct.getSach() != null ? ct.getSach().getTenSach() : null)
                    .hinhAnh(urlHinhAnh)
                    .soLuong(ct.getSoLuong())
                    .donGia(ct.getDonGia())
                    .trangThai(ct.getTrangThai())
                    .build();
        }).collect(Collectors.toList());

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

    @Override
    public HoaDonResponse changeOrderStatus(Integer idHoaDon, TrangThaiHoaDonRequest request) {
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));
        TaiKhoan taiKhoan = taiKhoanRepository.findById(10)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
        OrderStatus oldStatus = hoaDon.getTrangThai();
        OrderStatus newStatus = request.getOrderStatus();

        if (oldStatus == OrderStatus.CHO_XAC_NHAN && newStatus == OrderStatus.DA_XAC_NHAN) {
            List<HoaDonChiTiet> chiTietsToSubtract = hoaDonChiTietRepository.findByHoaDonId(idHoaDon);
            for (HoaDonChiTiet ct : chiTietsToSubtract) {
                Sach sach = ct.getSach();
                if (sach != null) {
                    if (sach.getSoLuong() < ct.getSoLuong()) {
                        throw new RuntimeException("Sản phẩm " + sach.getTenSach() + " không đủ số lượng (chỉ còn " + sach.getSoLuong() + ")");
                    }
                    sach.setSoLuong(sach.getSoLuong() - ct.getSoLuong());
                    sachRepository.save(sach);
                }
            }
        }

        if (newStatus == OrderStatus.DA_HUY && oldStatus != OrderStatus.CHO_XAC_NHAN && oldStatus != OrderStatus.DA_HUY) {
            List<HoaDonChiTiet> chiTietsToRefund = hoaDonChiTietRepository.findByHoaDonId(idHoaDon);
            for (HoaDonChiTiet ct : chiTietsToRefund) {
                Sach sach = ct.getSach();
                if (sach != null) {
                    sach.setSoLuong(sach.getSoLuong() + ct.getSoLuong());
                    sachRepository.save(sach);
                }
            }
        }

        hoaDon.setTrangThai(newStatus);
        hoaDon.setNgayCapNhat(LocalDateTime.now());
        hoaDonRepository.save(hoaDon);

        List<HoaDonChiTiet> chiTiets = hoaDonChiTietRepository.findByHoaDonId(idHoaDon);
        if (chiTiets != null && !chiTiets.isEmpty()) {
            chiTiets.forEach(ct -> {
                ct.setTrangThai(request.getOrderStatus());
                ct.setNgayCapNhat(LocalDateTime.now());
            });
            hoaDonChiTietRepository.saveAll(chiTiets);
        }

        LichSuDonHang lichSu = LichSuDonHang.builder()
                .taiKhoan(taiKhoan)
                .trangThai(request.getOrderStatus())
                .hoaDon(hoaDon)
                .ghiChu(request.getGhiChu())
                .ngayTao(LocalDateTime.now())
                .build();
        lichSuDonHangRepository.save(lichSu);

        if (oldStatus == OrderStatus.CHO_XAC_NHAN
                && newStatus == OrderStatus.DA_XAC_NHAN
                && hoaDon.getPhuongThuc() == PaymentMethod.CHUYEN_KHOAN) {
            hoaDonOrderMailService.sendOrderPlacedEmailFromPersistedOrder(hoaDon);
        }

        return HoaDonResponse.builder()
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
                .ghiChu(hoaDon.getGhiChu())
                .ngayTao(hoaDon.getNgayTao())
                .ngayCapNhat(hoaDon.getNgayCapNhat())
                .build();
    }

    @Override
    public List<LichSuDonHangResponse> getLichSuByHoaDonId(Integer idHoaDon) {
        List<LichSuDonHang> lichSuList = lichSuDonHangRepository.findByHoaDonIdOrderByNgayTaoDesc(idHoaDon);
        return lichSuList.stream().map(ls -> LichSuDonHangResponse.builder()
                .id(ls.getId())
                .idHoaDon(ls.getHoaDon().getId())
                .tenNhanVien(ls.getTaiKhoan() != null ? ls.getTaiKhoan().getHoTen() : null)
                .trangThai(ls.getTrangThai())
                .ghiChu(ls.getGhiChu())
                .ngayTao(ls.getNgayTao())
                .build()).collect(Collectors.toList());
    }

    @Override
    public HoaDonResponse updateHoaDon(Integer id, HoaDonUpdateRequest request) {
        HoaDon hoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));

        hoaDon.setHoTen(request.getHoTen());
        hoaDon.setSoDienThoai(request.getSoDienThoai());
        hoaDon.setEmail(request.getEmail());
        hoaDon.setDiaChiGiaoHang(request.getDiaChiGiaoHang());
        hoaDon.setPhiShip(request.getPhiShip());
        hoaDon.setNgayNhan(request.getNgayNhan());
        hoaDon.setGhiChu(request.getGhiChu());
        hoaDon.setNgayCapNhat(LocalDateTime.now());
        hoaDonRepository.save(hoaDon);

        TaiKhoan taiKhoan = taiKhoanRepository.findById(10).orElse(null);
        LichSuDonHang lichSu = LichSuDonHang.builder()
                .taiKhoan(taiKhoan)
                .trangThai(hoaDon.getTrangThai())
                .hoaDon(hoaDon)
                .ghiChu("Cập nhật thông tin nhận hàng")
                .ngayTao(LocalDateTime.now())
                .build();
        lichSuDonHangRepository.save(lichSu);

        return HoaDonResponse.builder()
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
                .ghiChu(hoaDon.getGhiChu())
                .ngayTao(hoaDon.getNgayTao())
                .ngayCapNhat(hoaDon.getNgayCapNhat())
                .build();
    }

    @Override
    public HoaDonResponse createHoaDonKhachHang(HoaDonCreateRequest request) {
        TaiKhoan khachHang = null;
        if (request.getIdTaiKhoan() != null) {
            khachHang = taiKhoanRepository.findById(request.getIdTaiKhoan()).orElse(null);
        }

        BigDecimal tongTienHang = BigDecimal.ZERO;
        if (request.getChiTiets() != null) {
            tongTienHang = request.getChiTiets().stream()
                    .map(ct -> ct.getDonGia().multiply(new BigDecimal(ct.getSoLuong())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        OrderStatus initialStatus = OrderStatus.CHO_XAC_NHAN;

        HoaDon hoaDon = HoaDon.builder()
                .khachHang(khachHang)
                .hoTen(request.getHoTen())
                .soDienThoai(request.getSoDienThoai())
                .email(request.getEmail())
                .diaChiGiaoHang(request.getDiaChiGiaoHang())
                .phiShip(request.getPhiShip() != null ? request.getPhiShip() : BigDecimal.ZERO)
                .tongTienHang(tongTienHang)
                .ghiChu(request.getGhiChu())
                .trangThai(initialStatus)
                .ngayNhan(request.getNgayNhan())
                .loaiHoaDon(TypeBill.ONLINE)
                .phuongThuc(request.getPhuongThucThanhToan())
                .ngayTao(LocalDateTime.now())
                .ngayCapNhat(LocalDateTime.now())
                .build();

        BigDecimal giamGia = BigDecimal.ZERO;
        MaGiamGia maGiamGia = null;
        if (request.getIdMaGiamGia() != null) {
            maGiamGia = maGiamGiaRepository.findById(request.getIdMaGiamGia()).orElse(null);
            if (maGiamGia != null) {
                giamGia = tinhSoTienGiamVoucherTheoRequest(maGiamGia, tongTienHang, request.getTienGiamGia());
                hoaDon.setGiamGia(giamGia);
            }
        } else {
            hoaDon.setGiamGia(BigDecimal.ZERO);
        }

        String maHoaDon = request.getMaHoaDon();
        if (maHoaDon == null || maHoaDon.trim().isEmpty()) {
            maHoaDon = "HD" + String.format("%05d", new Random().nextInt(100000));
        }
        hoaDon.setMaHoaDon(maHoaDon);
        hoaDon = hoaDonRepository.save(hoaDon);

        if (maGiamGia != null) {
            MaGiamGiaChiTiet mgct = MaGiamGiaChiTiet.builder()
                    .hoaDon(hoaDon)
                    .maGiamGia(maGiamGia)
                    .tienTruocKhiGiam(tongTienHang)
                    .soTienGiam(giamGia)
                    .tienSauKhiGiam(tongTienHang.subtract(giamGia))
                    .ngayTao(LocalDateTime.now())
                    .ngayCapNhat(LocalDateTime.now())
                    .build();
            maGiamGiaChiTietRepository.save(mgct);
            if (maGiamGia.getSoLuong() != null && maGiamGia.getSoLuong() > 0) {
                maGiamGia.setSoLuong(maGiamGia.getSoLuong() - 1);
                if (maGiamGia.getSoLuong() == 0) {
                    maGiamGia.setTrangThai(VoucherStatus.NGUNG_HOAT_DONG);
                }
                maGiamGiaRepository.save(maGiamGia);
            }
        }

        List<OrderMailLine> mailLines = new ArrayList<>();
        boolean guiMailNgayLucTaoDon = request.getPhuongThucThanhToan() != PaymentMethod.CHUYEN_KHOAN;
        if (request.getChiTiets() != null) {
            for (HoaDonChiTietRequest ctReq : request.getChiTiets()) {
                Sach sach = sachRepository.findById(ctReq.getIdSach()).orElse(null);
                
                // Đơn online khách tạo luôn CHO_XAC_NHAN — trừ tồn khi đặt hàng; hết tồn thì ẩn sách (trangThai = false)
                if (sach != null && initialStatus == OrderStatus.CHO_XAC_NHAN) {
                    int soLuongMoi = (sach.getSoLuong() != null ? sach.getSoLuong() : 0) - ctReq.getSoLuong();
                    if (soLuongMoi < 0) soLuongMoi = 0;
                    sach.setSoLuong(soLuongMoi);
                    if (soLuongMoi == 0) {
                        sach.setTrangThai(false);
                    }
                    sachRepository.save(sach);
                }

                HoaDonChiTiet chiTiet = HoaDonChiTiet.builder()
                        .hoaDon(hoaDon)
                        .sach(sach)
                        .soLuong(ctReq.getSoLuong())
                        .donGia(ctReq.getDonGia())
                        .trangThai(initialStatus)
                        .ngayTao(LocalDateTime.now())
                        .ngayCapNhat(LocalDateTime.now())
                        .build();
                hoaDonChiTietRepository.save(chiTiet);

                if (guiMailNgayLucTaoDon) {
                    String tenSach = sach != null && sach.getTenSach() != null ? sach.getTenSach() : "Sách #" + ctReq.getIdSach();
                    BigDecimal thanhTienDong = ctReq.getDonGia().multiply(BigDecimal.valueOf(ctReq.getSoLuong()));
                    mailLines.add(new OrderMailLine(tenSach, ctReq.getSoLuong(), ctReq.getDonGia(), thanhTienDong));
                }
            }

            // Xóa các sản phẩm đã mua khỏi giỏ hàng chi tiết của khách hàng
            if (khachHang != null) {
                GioHang gioHang = gioHangRepository.findByKhachHangId(khachHang.getId()).orElse(null);
                if (gioHang != null) {
                    for (HoaDonChiTietRequest ctReq : request.getChiTiets()) {
                        gioHangChiTietRepository
                                .findByGioHangIdAndSachId(gioHang.getId(), ctReq.getIdSach())
                                .ifPresent(gioHangChiTietRepository::delete);
                    }
                }
            }
        }

        LichSuDonHang lichSu = LichSuDonHang.builder()
                .taiKhoan(khachHang)
                .hoaDon(hoaDon)
                .trangThai(initialStatus)
                .ghiChu(initialStatus == OrderStatus.DA_XAC_NHAN ? "Khách hàng tạo đơn và chọn thanh toán VNPay" : "Khách hàng tạo đơn hàng trực tuyến")
                .ngayTao(LocalDateTime.now())
                .build();
        lichSuDonHangRepository.save(lichSu);

        if (guiMailNgayLucTaoDon && coEmailDeGui(hoaDon.getEmail())) {
            hoaDonOrderMailService.sendOrderPlacedEmail(hoaDon, mailLines, maGiamGia);
        }

        // Trả về maHoaDon để FE dùng khi gọi API tạo URL VNPay
        return HoaDonResponse.builder()
                .id(hoaDon.getId())
                .maHoaDon(hoaDon.getMaHoaDon())
                .hoTenKhachHang(hoaDon.getHoTen())
                .trangThai(hoaDon.getTrangThai())
                .build();
    }

    private static boolean coEmailDeGui(String email) {
        if (email == null) {
            return false;
        }
        String t = email.trim();
        return !t.isEmpty() && t.contains("@");
    }

    @Override
    public String clientCancelOrder(Integer idHoaDon, TrangThaiHoaDonRequest request) {
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));

        if (hoaDon.getTrangThai() != OrderStatus.CHO_XAC_NHAN) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng khi trạng thái là Chờ xác nhận. Trạng thái hiện tại: " + hoaDon.getTrangThai());
        }

        // Hoàn lại mã giảm giá nếu có
        maGiamGiaChiTietRepository.findFirstByHoaDon_Id(idHoaDon).ifPresent(mgct -> {
            MaGiamGia mgg = mgct.getMaGiamGia();
            if (mgg != null) {
                int soLuongHienTai = mgg.getSoLuong() != null ? mgg.getSoLuong() : 0;
                mgg.setSoLuong(soLuongHienTai + 1);
                if (mgg.getSoLuong() > 0) {
                    mgg.setTrangThai(VoucherStatus.HOAT_DONG);
                }
                maGiamGiaRepository.save(mgg);
            }
        });

        hoaDon.setTrangThai(OrderStatus.DA_HUY);
        hoaDon.setNgayCapNhat(LocalDateTime.now());
        hoaDonRepository.save(hoaDon);

        List<HoaDonChiTiet> chiTiets = hoaDonChiTietRepository.findByHoaDonId(idHoaDon);
        if (chiTiets != null && !chiTiets.isEmpty()) {
            chiTiets.forEach(ct -> {
                // Hoàn lại tồn kho sách khi đơn bị hủy
                Sach sach = ct.getSach();
                if (sach != null) {
                    int tonHienTai = sach.getSoLuong() != null ? sach.getSoLuong() : 0;
                    int soLuongTraLai = ct.getSoLuong() != null ? ct.getSoLuong() : 0;
                    sach.setSoLuong(tonHienTai + soLuongTraLai);
                    if (sach.getSoLuong() > 0) {
                        sach.setTrangThai(true);
                    }
                    sachRepository.save(sach);
                }

                ct.setTrangThai(OrderStatus.DA_HUY);
                ct.setNgayCapNhat(LocalDateTime.now());
            });
            hoaDonChiTietRepository.saveAll(chiTiets);
        }

        TaiKhoan khachHang = hoaDon.getKhachHang();
        LichSuDonHang lichSu = LichSuDonHang.builder()
                .taiKhoan(khachHang)
                .hoaDon(hoaDon)
                .trangThai(OrderStatus.DA_HUY)
                .ghiChu(request.getGhiChu() != null && !request.getGhiChu().trim().isEmpty() 
                        ? request.getGhiChu() : "Khách hàng hủy đơn hàng")
                .ngayTao(LocalDateTime.now())
                .build();
        lichSuDonHangRepository.save(lichSu);

        return "Hủy đơn hàng thành công";
    }

    @Override
    public List<HoaDonResponse> searchHoaDonByKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllHoaDon();
        }
        return hoaDonRepository.searchByKeyword(keyword)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<HoaDonResponse> searchHoaDonByDateRange(LocalDate tuNgay, LocalDate denNgay) {
        if (tuNgay == null || denNgay == null) {
            return getAllHoaDon();
        }
        LocalDateTime start = tuNgay.atStartOfDay();
        LocalDateTime end = denNgay.atTime(23, 59, 59);
        return hoaDonRepository.findByNgayTaoBetween(start, end)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HoaDonDetailResponse taoHoaDonBanTaiQuay(PosHoaDonCreateRequest request) {
        TaiKhoan nhanVien = getCurrentTaiKhoanOrThrow();
        LocalDateTime now = LocalDateTime.now();

        TaiKhoan khachHang = null;
        if (request.getIdKhachHang() != null) {
            khachHang = taiKhoanRepository.findById(request.getIdKhachHang())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));
        }

        String maHoaDon = "HD" + String.format("%05d", new Random().nextInt(100000));

        HoaDon hoaDon = HoaDon.builder()
                .nhanVien(nhanVien)
                .khachHang(khachHang)
                .hoTen(request.getHoTen())
                .soDienThoai(request.getSoDienThoai())
                .email(request.getEmail())
                .ghiChu(request.getGhiChu())
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
                .ghiChu("Tạo hóa đơn bán tại quầy")
                .ngayTao(now)
                .build());

        return getHoaDonChiTietByHoaDonId(hoaDon.getId());
    }

    @Override
    @Transactional
    public HoaDonDetailResponse themHangBanTaiQuay(Integer idHoaDon, PosHoaDonThemHangRequest request) {
        TaiKhoan nhanVien = getCurrentTaiKhoanOrThrow();
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn"));
        assertHoaDonBanTaiQuayHopLe(hoaDon, nhanVien);

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

        recalcTongTienHangVaLuu(hoaDon);
        return getHoaDonChiTietByHoaDonId(idHoaDon);
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

    private void assertHoaDonBanTaiQuayHopLe(HoaDon h, TaiKhoan nhanVien) {
        if (h.getLoaiHoaDon() != TypeBill.OFFLINE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Hóa đơn không phải bán tại quầy");
        }
        if (h.getTrangThai() != OrderStatus.TAO_HOA_DON) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ thao tác được khi hóa đơn đang ở trạng thái tạo hóa đơn (nháp)");
        }
        if (h.getNhanVien() == null || !h.getNhanVien().getId().equals(nhanVien.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không phải nhân viên tạo hóa đơn này");
        }
    }

    private void recalcTongTienHangVaLuu(HoaDon hoaDon) {
        List<HoaDonChiTiet> list = hoaDonChiTietRepository.findByHoaDonId(hoaDon.getId());
        BigDecimal sum = list.stream()
                .map(ct -> ct.getDonGia().multiply(BigDecimal.valueOf(ct.getSoLuong())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        hoaDon.setTongTienHang(sum);
        hoaDon.setNgayCapNhat(LocalDateTime.now());
        hoaDonRepository.save(hoaDon);
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

    private BigDecimal tinhSoTienGiamVoucherTheoRequest(MaGiamGia voucher, BigDecimal tongTienHang, BigDecimal tienGiamGiaRequest) {
        if (voucher == null) return BigDecimal.ZERO;
        BigDecimal tong = tongTienHang != null ? tongTienHang : BigDecimal.ZERO;
        BigDecimal giamToiDaTheoRule = tinhSoTienGiamVoucher(voucher, tong);

        // Voucher giảm theo tiền: luôn dùng giá trị cố định từ hệ thống
        if (voucher.getVoucherType() != VoucherType.GIAM_THEO_PHAN_TRAM) {
            return giamToiDaTheoRule;
        }

        // Voucher theo %: ưu tiên số tiền FE gửi lên (đã random), nhưng không vượt rule tối đa
        if (tienGiamGiaRequest == null) {
            return giamToiDaTheoRule;
        }
        BigDecimal giamTheoRequest = tienGiamGiaRequest;
        if (giamTheoRequest.compareTo(BigDecimal.ZERO) < 0) {
            giamTheoRequest = BigDecimal.ZERO;
        }

        BigDecimal giam = giamTheoRequest.min(giamToiDaTheoRule);
        if (giam.compareTo(tong) > 0) {
            giam = tong;
        }
        return giam;
    }

}
