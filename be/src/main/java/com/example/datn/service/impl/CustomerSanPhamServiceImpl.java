package com.example.datn.service.impl;

import com.example.datn.dto.response.client.ClientNhaXuatBanResponse;
import com.example.datn.dto.response.client.ClientSachDetailResponse;
import com.example.datn.dto.response.client.ClientSanPhamResponse;
import com.example.datn.dto.response.client.ClientTheLoaiResponse;
import com.example.datn.entity.Sach;
import com.example.datn.entity.SachHinhAnh;
import com.example.datn.entity.SachTacGia;
import com.example.datn.repository.NhaXuatBanRepository;
import com.example.datn.repository.SachHinhAnhRepository;
import com.example.datn.repository.SachRepository;
import com.example.datn.repository.SachTacGiaRepository;
import com.example.datn.repository.TheLoaiRepository;
import com.example.datn.service.CustomerSanPhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerSanPhamServiceImpl implements CustomerSanPhamService {

    private final SachRepository sachRepository;
    private final SachTacGiaRepository sachTacGiaRepository;
    private final SachHinhAnhRepository sachHinhAnhRepository;
    private final TheLoaiRepository theLoaiRepository;
    private final NhaXuatBanRepository nhaXuatBanRepository;

    @Override
    public List<ClientSanPhamResponse> getAllSanPham() {
        return mapToResponse(sachRepository.findByTrangThaiTrue());
    }

    @Override
    public List<ClientSanPhamResponse> getSanPhamBanChay() {
        List<Integer> bestSellingIds = sachRepository.findBestSellingSachIds(PageRequest.of(0, 10));

        if (bestSellingIds.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Integer, Sach> bookMap = sachRepository.findAllById(bestSellingIds).stream()
                .collect(Collectors.toMap(Sach::getId, s -> s));

        List<Sach> topSellers = bestSellingIds.stream()
                .map(bookMap::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return mapToResponse(topSellers);
    }

    @Override
    public List<ClientSanPhamResponse> getSanPhamMoiNhat() {
        List<Sach> newestBooks = sachRepository.findTop10Newest(PageRequest.of(0, 10));
        return mapToResponse(newestBooks);
    }

    @Override
    public ClientSachDetailResponse getChiTietSach(Integer id) {
        Sach sach = sachRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sách"));
        if (sach.getTrangThai() == null || !sach.getTrangThai()) {
            throw new IllegalArgumentException("Sách đã ngừng kinh doanh");
        }

        List<SachTacGia> sachTacGias = sachTacGiaRepository.findBySachIdIn(Collections.singletonList(id));
        List<String> tacGias = sachTacGias.stream()
                .map(stg -> stg.getTacGia().getTenTacGia())
                .collect(Collectors.toList());

        List<SachHinhAnh> sachHinhAnhs = sachHinhAnhRepository.findBySachIdIn(Collections.singletonList(id));
        List<String> hinhAnhs = sachHinhAnhs.stream()
                .map(SachHinhAnh::getDuongDan)
                .collect(Collectors.toList());

        return ClientSachDetailResponse.builder()
                .id(sach.getId())
                .maSach(sach.getMaSach())
                .tenSach(sach.getTenSach())
                .giaBan(sach.getGiaBan())
                .soLuong(sach.getSoLuong())
                .tenNhaXuatBan(sach.getNhaXuatBan() != null ? sach.getNhaXuatBan().getTenNxb() : null)
                .tenTacGias(tacGias)
                .hinhAnhs(hinhAnhs)
                .moTa(sach.getMoTa())
                .soTrang(sach.getSoTrang())
                .ngonNgu(sach.getNgonNgu())
                .namXuatBan(sach.getNamXuatBan())
                .kichThuoc(sach.getKichThuoc())
                .tenTheLoai(sach.getTheLoai() != null ? sach.getTheLoai().getTenTheLoai() : null)
                .build();
    }

    @Override
    public void validateQuantity(Integer id, Integer quantity) {
        Sach sach = sachRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sách"));
        if (sach.getTrangThai() == null || !sach.getTrangThai()) {
            throw new IllegalArgumentException("Sách đã ngừng kinh doanh");
        }
        if (sach.getSoLuong() < quantity) {
            throw new IllegalArgumentException("Số lượng yêu cầu vượt quá số lượng tồn kho");
        }
    }

    @Override
    public List<ClientTheLoaiResponse> getAllTheLoai() {
        return theLoaiRepository.findAll().stream()
                .map(tl -> ClientTheLoaiResponse.builder()
                        .id(tl.getId())
                        .tenTheLoai(tl.getTenTheLoai())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<ClientSanPhamResponse> getSanPhamByTheLoai(Integer idTheLoai) {
        List<Sach> books = sachRepository.findByTheLoaiIdAndTrangThaiTrue(idTheLoai);
        return mapToResponse(books);
    }

    @Override
    public List<ClientNhaXuatBanResponse> getAllNhaXuatBan() {
        return nhaXuatBanRepository.findAll().stream()
                .map(nxb -> ClientNhaXuatBanResponse.builder()
                        .id(nxb.getId())
                        .tenNxb(nxb.getTenNxb())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<ClientSanPhamResponse> getSanPhamByNhaXuatBan(Integer idNhaXuatBan) {
        List<Sach> books = sachRepository.findByNhaXuatBanIdAndTrangThaiTrue(idNhaXuatBan);
        return mapToResponse(books);
    }

    @Override
    public List<ClientSanPhamResponse> searchSanPhamByTen(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAllSanPham();
        }
        List<Sach> books = sachRepository.findByTenSachContainingIgnoreCaseAndTrangThaiTrue(keyword.trim());
        return mapToResponse(books);
    }

    private List<ClientSanPhamResponse> mapToResponse(List<Sach> books) {
        if (books.isEmpty()) {
            return Collections.emptyList();
        }

        List<Integer> sachIds = books.stream().map(Sach::getId).collect(Collectors.toList());
        List<SachTacGia> authorMappings = sachTacGiaRepository.findBySachIdIn(sachIds);
        List<SachHinhAnh> imageMappings = sachHinhAnhRepository.findBySachIdIn(sachIds);

        Map<Integer, List<String>> authorMap = authorMappings.stream()
                .filter(stg -> stg.getSach() != null && stg.getTacGia() != null)
                .collect(Collectors.groupingBy(
                        stg -> stg.getSach().getId(),
                        Collectors.mapping(stg -> stg.getTacGia().getTenTacGia(), Collectors.toList())
                ));

        Map<Integer, List<String>> imageMap = imageMappings.stream()
                .filter(sha -> sha.getSach() != null)
                .collect(Collectors.groupingBy(
                        sha -> sha.getSach().getId(),
                        Collectors.mapping(SachHinhAnh::getDuongDan, Collectors.toList())
                ));

        return books.stream().map(sach -> ClientSanPhamResponse.builder()
                .id(sach.getId())
                .tenSach(sach.getTenSach())
                .giaBan(sach.getGiaBan())
                .soLuong(sach.getSoLuong())
                .tenNhaXuatBan(sach.getNhaXuatBan() != null ? sach.getNhaXuatBan().getTenNxb() : null)
                .tenTacGias(authorMap.getOrDefault(sach.getId(), Collections.emptyList()))
                .hinhAnhs(imageMap.getOrDefault(sach.getId(), Collections.emptyList()))
                .build()).collect(Collectors.toList());
    }
}
