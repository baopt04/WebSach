package com.example.datn.service.impl;

import com.example.datn.dto.request.CapNhatThongTinRequest;
import com.example.datn.dto.request.DiaChiCustomerRequest;
import com.example.datn.dto.request.DoiMatKhauRequest;
import com.example.datn.dto.response.*;
import com.example.datn.entity.DiaChi;
import com.example.datn.entity.HoaDon;
import com.example.datn.entity.HoaDonChiTiet;
import com.example.datn.entity.SachHinhAnh;
import com.example.datn.entity.TaiKhoan;
import com.example.datn.exception.AppException;
import com.example.datn.entity.LichSuDonHang;
import com.example.datn.repository.DiaChiRepository;
import com.example.datn.repository.HoaDonChiTietRepository;
import com.example.datn.repository.HoaDonRepository;
import com.example.datn.repository.LichSuDonHangRepository;
import com.example.datn.repository.SachHinhAnhRepository;
import com.example.datn.repository.TaiKhoanRepository;
import com.example.datn.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final DiaChiRepository diaChiRepository;
    private final HoaDonRepository hoaDonRepository;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;
    private final LichSuDonHangRepository lichSuDonHangRepository;
    private final SachHinhAnhRepository sachHinhAnhRepository;
    private final PasswordEncoder passwordEncoder;


    private TaiKhoan getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));
    }

    @Override
    public List<DiaChiResponse> getMyAddresses() {
        TaiKhoan taiKhoan = getCurrentUser();
        return diaChiRepository.findByTaiKhoanIdOrderByNgayCapNhatDesc(taiKhoan.getId())
                .stream().map(this::mapToDiaChiResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DiaChiResponse createMyAddress(DiaChiCustomerRequest request) {
        TaiKhoan taiKhoan = getCurrentUser();

        DiaChi diaChi = DiaChi.builder()
                .taiKhoan(taiKhoan)
                .hoTen(request.getHoTen())
                .soDienThoai(request.getSoDienThoai())
                .idTinhThanh(request.getIdTinhThanh())
                .tinhThanh(request.getTinhThanh())
                .idQuanHuyen(request.getIdQuanHuyen())
                .quanHuyen(request.getQuanHuyen())
                .idPhuongXa(request.getIdPhuongXa())
                .phuongXa(request.getPhuongXa())
                .diaChiChiTiet(request.getDiaChiChiTiet())
                .macDinh(false)
                .ngayTao(LocalDateTime.now())
                .ngayCapNhat(LocalDateTime.now())
                .build();

        DiaChi saved = diaChiRepository.save(diaChi);
        return mapToDiaChiResponse(saved);
    }

    @Override
    public DiaChiResponse updateMyAddress(Integer idDiaChi, DiaChiCustomerRequest request) {
        TaiKhoan taiKhoan = getCurrentUser();
        DiaChi diaChi = diaChiRepository.findById(idDiaChi)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ với ID: " + idDiaChi));


        if (!diaChi.getTaiKhoan().getId().equals(taiKhoan.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền chỉnh sửa địa chỉ này");
        }

        diaChi.setHoTen(request.getHoTen());
        diaChi.setSoDienThoai(request.getSoDienThoai());
        diaChi.setIdTinhThanh(request.getIdTinhThanh());
        diaChi.setTinhThanh(request.getTinhThanh());
        diaChi.setIdQuanHuyen(request.getIdQuanHuyen());
        diaChi.setQuanHuyen(request.getQuanHuyen());
        diaChi.setIdPhuongXa(request.getIdPhuongXa());
        diaChi.setPhuongXa(request.getPhuongXa());
        diaChi.setDiaChiChiTiet(request.getDiaChiChiTiet());
        diaChi.setNgayCapNhat(LocalDateTime.now());

        DiaChi updated = diaChiRepository.save(diaChi);
        return mapToDiaChiResponse(updated);
    }

    @Override
    public void deleteMyAddress(Integer idDiaChi) {
        TaiKhoan taiKhoan = getCurrentUser();
        DiaChi diaChi = diaChiRepository.findById(idDiaChi)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ với ID: " + idDiaChi));

        if (!diaChi.getTaiKhoan().getId().equals(taiKhoan.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xóa địa chỉ này");
        }

        if (Boolean.TRUE.equals(diaChi.getMacDinh())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không được xóa địa chỉ mặc định");
        }

        diaChiRepository.delete(diaChi);
    }

    @Override
    public void setDefaultAddress(Integer idDiaChi) {
        TaiKhoan taiKhoan = getCurrentUser();
        DiaChi diaChi = diaChiRepository.findById(idDiaChi)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ với ID: " + idDiaChi));

        if (!diaChi.getTaiKhoan().getId().equals(taiKhoan.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền thao tác với địa chỉ này");
        }


        List<DiaChi> allAddresses = diaChiRepository.findByTaiKhoanIdOrderByNgayCapNhatDesc(taiKhoan.getId());
        allAddresses.forEach(d -> {
            d.setMacDinh(false);
            d.setNgayCapNhat(LocalDateTime.now());
        });

        diaChi.setMacDinh(true);
        diaChi.setNgayCapNhat(LocalDateTime.now());
        diaChiRepository.saveAll(allAddresses);
    }


    @Override
    public List<HoaDonCustomerSummaryResponse> getMyOrders() {
        TaiKhoan taiKhoan = getCurrentUser();
        List<HoaDon> hoaDons = hoaDonRepository.findByKhachHangIdOrderByNgayCapNhatDesc(taiKhoan.getId());

        return hoaDons.stream().map(hd -> {
            List<HoaDonChiTiet> chiTiets = hoaDonChiTietRepository.findByHoaDonId(hd.getId());
            List<SanPhamTomTatResponse> sanPhams = chiTiets.stream().map(ct -> {
                String hinhAnh = null;
                if (ct.getSach() != null) {
                    List<SachHinhAnh> imgs = sachHinhAnhRepository.findBySachId(ct.getSach().getId());
                    if (imgs != null && !imgs.isEmpty()) {
                        hinhAnh = imgs.stream()
                                .filter(img -> Boolean.TRUE.equals(img.getLaAnhChinh()))
                                .findFirst()
                                .map(SachHinhAnh::getDuongDan)
                                .orElse(imgs.get(0).getDuongDan());
                    }
                }
                return SanPhamTomTatResponse.builder()
                        .idSach(ct.getSach() != null ? ct.getSach().getId() : null)
                        .tenSach(ct.getSach() != null ? ct.getSach().getTenSach() : null)
                        .hinhAnh(hinhAnh)
                        .donGia(ct.getDonGia())
                        .soLuong(ct.getSoLuong())
                        .build();
            }).collect(Collectors.toList());

            return HoaDonCustomerSummaryResponse.builder()
                    .id(hd.getId())
                    .maHoaDon(hd.getMaHoaDon())
                    .trangThai(hd.getTrangThai())
                    .tongTienHang(hd.getTongTienHang())
                    .phiShip(hd.getPhiShip())
                    .giamGia(hd.getGiamGia())
                    .ngayTao(hd.getNgayTao())
                    .ngayCapNhat(hd.getNgayCapNhat())
                    .sanPhams(sanPhams)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public HoaDonDetailResponse getMyOrderDetail(Integer idHoaDon) {
        TaiKhoan taiKhoan = getCurrentUser();
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn"));


        if (hoaDon.getKhachHang() == null || !hoaDon.getKhachHang().getId().equals(taiKhoan.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem đơn hàng này");
        }

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
                .ngayNhan(hoaDon.getNgayNhan())
                .phuongThuc(hoaDon.getPhuongThuc())
                .loaiHoaDon(hoaDon.getLoaiHoaDon())
                .ghiChu(hoaDon.getGhiChu())
                .ngayTao(hoaDon.getNgayTao())
                .ngayCapNhat(hoaDon.getNgayCapNhat())
                .build();

        List<HoaDonChiTiet> chiTiets = hoaDonChiTietRepository.findByHoaDonId(idHoaDon);
        List<HoaDonChiTietResponse> ctResponses = chiTiets.stream().map(ct -> {
            String hinhAnh = null;
            if (ct.getSach() != null) {
                List<SachHinhAnh> imgs = sachHinhAnhRepository.findBySachId(ct.getSach().getId());
                if (imgs != null && !imgs.isEmpty()) {
                    hinhAnh = imgs.stream()
                            .filter(img -> Boolean.TRUE.equals(img.getLaAnhChinh()))
                            .findFirst()
                            .map(SachHinhAnh::getDuongDan)
                            .orElse(imgs.get(0).getDuongDan());
                }
            }
            return HoaDonChiTietResponse.builder()
                    .id(ct.getId())
                    .idHoaDon(ct.getHoaDon().getId())
                    .idSach(ct.getSach() != null ? ct.getSach().getId() : null)
                    .maSach(ct.getSach() != null ? ct.getSach().getMaSach() : null)
                    .tenSach(ct.getSach() != null ? ct.getSach().getTenSach() : null)
                    .hinhAnh(hinhAnh)
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
    public HoaDonDetailResponse searchHoaDonByPhoneAndCode(String soDienThoai, String maHoaDon) {
        HoaDon hoaDon = hoaDonRepository.findBySoDienThoaiAndMaHoaDon(soDienThoai, maHoaDon)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với SĐT và mã cung cấp"));

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

        List<HoaDonChiTiet> chiTiets = hoaDonChiTietRepository.findByHoaDonId(hoaDon.getId());
        List<HoaDonChiTietResponse> ctResponses = chiTiets.stream().map(ct -> {
            String hinhAnh = null;
            if (ct.getSach() != null) {
                List<SachHinhAnh> imgs = sachHinhAnhRepository.findBySachId(ct.getSach().getId());
                if (imgs != null && !imgs.isEmpty()) {
                    hinhAnh = imgs.stream()
                            .filter(img -> Boolean.TRUE.equals(img.getLaAnhChinh()))
                            .findFirst()
                            .map(SachHinhAnh::getDuongDan)
                            .orElse(imgs.get(0).getDuongDan());
                }
            }
            return HoaDonChiTietResponse.builder()
                    .id(ct.getId())
                    .idHoaDon(ct.getHoaDon().getId())
                    .idSach(ct.getSach() != null ? ct.getSach().getId() : null)
                    .maSach(ct.getSach() != null ? ct.getSach().getMaSach() : null)
                    .tenSach(ct.getSach() != null ? ct.getSach().getTenSach() : null)
                    .hinhAnh(hinhAnh)
                    .soLuong(ct.getSoLuong())
                    .donGia(ct.getDonGia())
                    .trangThai(ct.getTrangThai())
                    .build();
        }).collect(Collectors.toList());

        List<LichSuDonHang> lichSuList = lichSuDonHangRepository.findByHoaDonIdOrderByNgayTaoDesc(hoaDon.getId());
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
    public TaiKhoanResponse getMyProfile() {
        TaiKhoan taiKhoan = getCurrentUser();
        return mapToTaiKhoanResponse(taiKhoan);
    }

    @Override
    public TaiKhoanResponse updateMyProfile(CapNhatThongTinRequest request) {
        TaiKhoan taiKhoan = getCurrentUser();

        if (taiKhoanRepository.existsBySoDienThoaiAndIdNot(request.getSoDienThoai(), taiKhoan.getId())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Số điện thoại đã tồn tại ở tài khoản khác");
        }


        if (request.getNgaySinh() != null) {
            int age = Period.between(request.getNgaySinh(), LocalDate.now()).getYears();
            if (age < 18) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Bạn phải từ đủ 18 tuổi trở lên");
            }
        }

        taiKhoan.setHoTen(request.getHoTen());
        taiKhoan.setSoDienThoai(request.getSoDienThoai());
        taiKhoan.setGioiTinh(request.getGioiTinh());
        taiKhoan.setNgaySinh(request.getNgaySinh());
        taiKhoan.setNgayCapNhat(LocalDateTime.now());

        TaiKhoan updated = taiKhoanRepository.save(taiKhoan);
        return mapToTaiKhoanResponse(updated);
    }


    @Override
    public void doiMatKhau(DoiMatKhauRequest request) {
        TaiKhoan taiKhoan = getCurrentUser();


        if (!passwordEncoder.matches(request.getMatKhauCu(), taiKhoan.getMatKhau())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mật khẩu cũ không đúng");
        }


        if (!request.getMatKhauMoi().equals(request.getXacNhanMatKhauMoi())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mật khẩu mới và xác nhận mật khẩu không khớp");
        }


        if (passwordEncoder.matches(request.getMatKhauMoi(), taiKhoan.getMatKhau())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mật khẩu mới không được trùng với mật khẩu cũ");
        }

        taiKhoan.setMatKhau(passwordEncoder.encode(request.getMatKhauMoi()));
        taiKhoan.setNgayCapNhat(LocalDateTime.now());
        taiKhoanRepository.save(taiKhoan);
    }

    private DiaChiResponse mapToDiaChiResponse(DiaChi entity) {
        return DiaChiResponse.builder()
                .id(entity.getId())
                .idTaiKhoan(entity.getTaiKhoan() != null ? entity.getTaiKhoan().getId() : null)
                .hoTen(entity.getHoTen())
                .soDienThoai(entity.getSoDienThoai())
                .emailTaiKhoan(entity.getTaiKhoan() != null ? entity.getTaiKhoan().getEmail() : null)
                .idTinhThanh(entity.getIdTinhThanh())
                .tinhThanh(entity.getTinhThanh())
                .idQuanHuyen(entity.getIdQuanHuyen())
                .quanHuyen(entity.getQuanHuyen())
                .idPhuongXa(entity.getIdPhuongXa())
                .phuongXa(entity.getPhuongXa())
                .diaChiChiTiet(entity.getDiaChiChiTiet())
                .macDinh(entity.getMacDinh())
                .ngayTao(entity.getNgayTao())
                .ngayCapNhat(entity.getNgayCapNhat())
                .build();
    }

    private TaiKhoanResponse mapToTaiKhoanResponse(TaiKhoan entity) {
        return TaiKhoanResponse.builder()
                .id(entity.getId())
                .maTaiKhoan(entity.getMaTaiKhoan())
                .email(entity.getEmail())
                .hoTen(entity.getHoTen())
                .soDienThoai(entity.getSoDienThoai())
                .vaiTro(entity.getVaiTro())
                .trangThai(entity.getTrangThai())
                .ngaySinh(entity.getNgaySinh())
                .gioiTinh(entity.getGioiTinh())
                .ngayTao(entity.getNgayTao())
                .ngayCapNhat(entity.getNgayCapNhat())
                .build();
    }
}
