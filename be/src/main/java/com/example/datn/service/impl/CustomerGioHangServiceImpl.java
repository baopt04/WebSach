package com.example.datn.service.impl;

import com.example.datn.dto.request.giohang.GioHangRequest;
import com.example.datn.dto.response.giohang.GioHangChiTietResponse;
import com.example.datn.dto.response.giohang.GioHangResponse;
import com.example.datn.entity.GioHang;
import com.example.datn.entity.GioHangChiTiet;
import com.example.datn.entity.Sach;
import com.example.datn.entity.SachHinhAnh;
import com.example.datn.entity.TaiKhoan;
import com.example.datn.repository.GioHangChiTietRepository;
import com.example.datn.repository.GioHangRepository;
import com.example.datn.repository.SachRepository;
import com.example.datn.repository.SachHinhAnhRepository;
import com.example.datn.repository.TaiKhoanRepository;
import com.example.datn.service.CustomerGioHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CustomerGioHangServiceImpl implements CustomerGioHangService {

    @Autowired
    private GioHangRepository gioHangRepository;

    @Autowired
    private GioHangChiTietRepository gioHangChiTietRepository;

    @Autowired
    private SachRepository sachRepository;

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private SachHinhAnhRepository sachHinhAnhRepository;

    private GioHang getOrCreateGioHang(Integer idKhachHang) {
        return gioHangRepository.findByKhachHangId(idKhachHang).orElseGet(() -> {
            TaiKhoan tk = taiKhoanRepository.findById(idKhachHang)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
            GioHang newCart = GioHang.builder()
                    .khachHang(tk)
                    .tongTien(BigDecimal.ZERO)
                    .ngayTao(LocalDateTime.now())
                    .ngayCapNhat(LocalDateTime.now())
                    .build();
            return gioHangRepository.save(newCart);
        });
    }

    private void updateTongTienGioHang(GioHang gioHang) {
        List<GioHangChiTiet> list = gioHangChiTietRepository.findByGioHangId(gioHang.getId());
        BigDecimal tong = list.stream()
                .map(ct -> ct.getGia().multiply(new BigDecimal(ct.getSoLuong())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        gioHang.setTongTien(tong);
        gioHang.setNgayCapNhat(LocalDateTime.now());
        gioHangRepository.save(gioHang);
    }

    @Override
    public GioHangResponse getCartDetails(Integer idKhachHang) {
        GioHang gioHang = getOrCreateGioHang(idKhachHang);
        List<GioHangChiTiet> list = gioHangChiTietRepository.findByGioHangId(gioHang.getId());
        
        List<GioHangChiTietResponse> chiTietResponses = list.stream().map(ct -> {
            Sach s = ct.getSach();
            List<SachHinhAnh> hinhAnhs = sachHinhAnhRepository.findBySachId(s.getId());
            String hinhAnh = null;
            if (hinhAnhs != null && !hinhAnhs.isEmpty()) {
                hinhAnh = hinhAnhs.stream()
                        .filter(img -> Boolean.TRUE.equals(img.getLaAnhChinh()))
                        .findFirst()
                        .map(SachHinhAnh::getDuongDan)
                        .orElse(hinhAnhs.get(0).getDuongDan());
            }
            return GioHangChiTietResponse.builder()
                    .idGioHangChiTiet(ct.getId())
                    .idSach(s.getId())
                    .tenSach(s.getTenSach())
                    .hinhAnh(hinhAnh)
                    .giaBan(ct.getGia())
                    .soLuong(ct.getSoLuong())
                    .tongTienChung(ct.getGia().multiply(new BigDecimal(ct.getSoLuong())))
                    .build();
        }).collect(Collectors.toList());

        return GioHangResponse.builder()
                .idGioHang(gioHang.getId())
                .tongTien(gioHang.getTongTien())
                .chiTietList(chiTietResponses)
                .build();
    }

    @Override
    @Transactional
    public String addCartItem(Integer idKhachHang, GioHangRequest request) {
        GioHang gioHang = getOrCreateGioHang(idKhachHang);
        Sach sach = sachRepository.findById(request.getIdSach())
                .orElseThrow(() -> new RuntimeException("Sách không tồn tại"));

        if (!Boolean.TRUE.equals(sach.getTrangThai())) {
            throw new RuntimeException("Sách đã ngừng kinh doanh");
        }

        if (sach.getSoLuong() < request.getSoLuong()) {
            throw new RuntimeException("Số lượng sách tồn không đủ, còn lại: " + sach.getSoLuong());
        }

        Optional<GioHangChiTiet> optCT = gioHangChiTietRepository.findByGioHangIdAndSachId(gioHang.getId(), sach.getId());
        if (optCT.isPresent()) {
            GioHangChiTiet ct = optCT.get();
            int newQty = ct.getSoLuong() + request.getSoLuong();
            if (sach.getSoLuong() < newQty) {
                throw new RuntimeException("Vượt quá số lượng tồn kho");
            }
            ct.setSoLuong(newQty);
            ct.setNgayCapNhat(LocalDateTime.now());
            gioHangChiTietRepository.save(ct);
        } else {
            GioHangChiTiet newCT = GioHangChiTiet.builder()
                    .gioHang(gioHang)
                    .sach(sach)
                    .soLuong(request.getSoLuong())
                    .gia(sach.getGiaBan())
                    .ngayTao(LocalDateTime.now())
                    .ngayCapNhat(LocalDateTime.now())
                    .build();
            gioHangChiTietRepository.save(newCT);
        }

        updateTongTienGioHang(gioHang);
        return "Thêm vào giỏ hàng thành công";
    }

    @Override
    @Transactional
    public String updateQuantity(Integer idKhachHang, Integer idGioHangChiTiet, Integer quantity) {
        GioHang gioHang = getOrCreateGioHang(idKhachHang);
        GioHangChiTiet ct = gioHangChiTietRepository.findById(idGioHangChiTiet)
                .orElseThrow(() -> new RuntimeException("Mục trong giỏ hàng không tồn tại"));

        if (!ct.getGioHang().getId().equals(gioHang.getId())) {
            throw new RuntimeException("Mục này không thuộc giỏ hàng của bạn");
        }

        if (quantity <= 0) {
            gioHangChiTietRepository.delete(ct);
        } else {
            Sach sach = ct.getSach();
            if (sach.getSoLuong() < quantity) {
                throw new RuntimeException("Số lượng sách tồn không đủ");
            }
            ct.setSoLuong(quantity);
            ct.setNgayCapNhat(LocalDateTime.now());
            gioHangChiTietRepository.save(ct);
        }

        updateTongTienGioHang(gioHang);
        return "Cập nhật số lượng thành công";
    }

    @Override
    @Transactional
    public String removeCartItem(Integer idKhachHang, Integer idGioHangChiTiet) {
        GioHang gioHang = getOrCreateGioHang(idKhachHang);
        GioHangChiTiet ct = gioHangChiTietRepository.findById(idGioHangChiTiet)
                .orElseThrow(() -> new RuntimeException("Mục trong giỏ hàng không tồn tại"));

        if (!ct.getGioHang().getId().equals(gioHang.getId())) {
            throw new RuntimeException("Mục này không thuộc giỏ hàng của bạn");
        }

        gioHangChiTietRepository.delete(ct);
        updateTongTienGioHang(gioHang);
        return "Xóa sản phẩm khỏi giỏ hàng thành công";
    }
}
