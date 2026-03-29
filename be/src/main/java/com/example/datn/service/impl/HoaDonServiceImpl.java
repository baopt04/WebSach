package com.example.datn.service.impl;

import com.example.datn.dto.request.HoaDonChiTietRequest;
import com.example.datn.dto.request.HoaDonCreateRequest;
import com.example.datn.dto.request.HoaDonUpdateRequest;
import com.example.datn.dto.request.TrangThaiHoaDonRequest;
import com.example.datn.dto.response.HoaDonChiTietResponse;
import com.example.datn.dto.response.HoaDonDetailResponse;
import com.example.datn.dto.response.HoaDonResponse;
import com.example.datn.dto.response.LichSuDonHangResponse;
import com.example.datn.entity.HoaDon;
import com.example.datn.entity.HoaDonChiTiet;
import com.example.datn.entity.LichSuDonHang;
import com.example.datn.entity.MaGiamGia;
import com.example.datn.entity.MaGiamGiaChiTiet;
import com.example.datn.entity.Sach;
import com.example.datn.entity.SachHinhAnh;
import com.example.datn.entity.TaiKhoan;
import com.example.datn.enums.OrderStatus;
import com.example.datn.enums.TypeBill;
import com.example.datn.repository.HoaDonChiTietRepository;
import com.example.datn.repository.HoaDonRepository;
import com.example.datn.repository.LichSuDonHangRepository;
import com.example.datn.repository.MaGiamGiaChiTietRepository;
import com.example.datn.repository.MaGiamGiaRepository;
import com.example.datn.repository.SachHinhAnhRepository;
import com.example.datn.repository.SachRepository;
import com.example.datn.repository.TaiKhoanRepository;
import com.example.datn.service.HoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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

        return HoaDonDetailResponse.builder()
                .hoaDon(hdResponse)
                .chiTiets(ctResponses)
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

        HoaDon hoaDon = HoaDon.builder()
                .khachHang(khachHang)
                .hoTen(request.getHoTen())
                .soDienThoai(request.getSoDienThoai())
                .email(request.getEmail())
                .diaChiGiaoHang(request.getDiaChiGiaoHang())
                .phiShip(request.getPhiShip() != null ? request.getPhiShip() : BigDecimal.ZERO)
                .tongTienHang(tongTienHang)
                .ghiChu(request.getGhiChu())
                .trangThai(OrderStatus.CHO_XAC_NHAN)
                .phuongThuc(request.getPaymentMethod())
                .loaiHoaDon(TypeBill.ONLINE)
                .ngayTao(LocalDateTime.now())
                .ngayCapNhat(LocalDateTime.now())
                .build();

        BigDecimal giamGia = BigDecimal.ZERO;
        MaGiamGia maGiamGia = null;
        if (request.getIdMaGiamGia() != null) {
            maGiamGia = maGiamGiaRepository.findById(request.getIdMaGiamGia()).orElse(null);
            if (maGiamGia != null) {
                giamGia = maGiamGia.getGiaTriGiam();
                hoaDon.setGiamGia(giamGia);
            }
        } else {
            hoaDon.setGiamGia(BigDecimal.ZERO);
        }

        String randomMaHD = "HD" + String.format("%05d", new Random().nextInt(100000));
        hoaDon.setMaHoaDon(randomMaHD);
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
                maGiamGiaRepository.save(maGiamGia);
            }
        }

        if (request.getChiTiets() != null) {
            for (HoaDonChiTietRequest ctReq : request.getChiTiets()) {
                Sach sach = sachRepository.findById(ctReq.getIdSach()).orElse(null);
                HoaDonChiTiet chiTiet = HoaDonChiTiet.builder()
                        .hoaDon(hoaDon)
                        .sach(sach)
                        .soLuong(ctReq.getSoLuong())
                        .donGia(ctReq.getDonGia())
                        .trangThai(OrderStatus.CHO_XAC_NHAN)
                        .ngayTao(LocalDateTime.now())
                        .ngayCapNhat(LocalDateTime.now())
                        .build();
                hoaDonChiTietRepository.save(chiTiet);
            }
        }

        LichSuDonHang lichSu = LichSuDonHang.builder()
                .taiKhoan(khachHang)
                .hoaDon(hoaDon)
                .trangThai(OrderStatus.CHO_XAC_NHAN)
                .ghiChu("Khách hàng tạo đơn hàng trực tuyến")
                .ngayTao(LocalDateTime.now())
                .build();
        lichSuDonHangRepository.save(lichSu);

        return HoaDonResponse.builder()
                .id(hoaDon.getId())
                .maHoaDon(hoaDon.getMaHoaDon())
                .hoTenKhachHang(hoaDon.getHoTen())
                .trangThai(hoaDon.getTrangThai())
                .build();
    }

    @Override
    public String clientCancelOrder(Integer idHoaDon, TrangThaiHoaDonRequest request) {
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));

        if (hoaDon.getTrangThai() != OrderStatus.CHO_XAC_NHAN) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng khi trạng thái là Chờ xác nhận. Trạng thái hiện tại: " + hoaDon.getTrangThai());
        }

        hoaDon.setTrangThai(OrderStatus.DA_HUY);
        hoaDon.setNgayCapNhat(LocalDateTime.now());
        hoaDonRepository.save(hoaDon);

        List<HoaDonChiTiet> chiTiets = hoaDonChiTietRepository.findByHoaDonId(idHoaDon);
        if (chiTiets != null && !chiTiets.isEmpty()) {
            chiTiets.forEach(ct -> {
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
                .ghiChu(request.getGhiChu() != null ? request.getGhiChu() : "Khách hàng hủy đơn hàng")
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
}
