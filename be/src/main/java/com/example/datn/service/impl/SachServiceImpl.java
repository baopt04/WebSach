package com.example.datn.service.impl;

import com.example.datn.dto.request.SachRequest;
import com.example.datn.dto.response.SachResponse;
import com.example.datn.entity.*;
import com.example.datn.repository.*;
import com.example.datn.service.SachService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SachServiceImpl implements SachService {

    private final SachRepository sachRepository;
    private final TheLoaiRepository theLoaiRepository;
    private final NhaXuatBanRepository nhaXuatBanRepository;
    private final SachHinhAnhRepository sachHinhAnhRepository;

    @Override
    public List<SachResponse> getAll() {
        return sachRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public SachResponse detail(Integer id) {
        Sach sach = sachRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách"));

        return mapToResponse(sach);
    }

    @Override
    public SachResponse add(SachRequest request) {

        if (sachRepository.findByMaSach(request.getMaSach()).isPresent()) {
            throw new RuntimeException("Mã sách đã tồn tại");
        }

        TheLoai theLoai = theLoaiRepository.findById(request.getIdTheLoai())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thể loại"));

        NhaXuatBan nxb = nhaXuatBanRepository.findById(request.getIdNxb())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy NXB"));

        Sach sach = Sach.builder()
                .maSach(request.getMaSach())
                .maVach(request.getMaVach())
                .tenSach(request.getTenSach())
                .giaBan(request.getGiaBan())
                .soLuong(request.getSoLuong())
                .soTrang(request.getSoTrang())
                .ngonNgu(request.getNgonNgu())
                .namXuatBan(request.getNamXuatBan())
                .kichThuoc(request.getKichThuoc())
                .moTa(request.getMoTa())
                .theLoai(theLoai)
                .nhaXuatBan(nxb)
                .trangThai(true)
                .ngayTao(LocalDateTime.now())
                .ngayCapNhat(LocalDateTime.now())
                .build();

        Sach savedSach = sachRepository.save(sach);

        if (request.getDuongDanAnh() != null && !request.getDuongDanAnh().isBlank()) {
            SachHinhAnh hinhAnh = SachHinhAnh.builder()
                    .sach(savedSach)
                    .duongDan(request.getDuongDanAnh())
                    .laAnhChinh(true)
                    .ngayTao(LocalDateTime.now())
                    .build();

            sachHinhAnhRepository.save(hinhAnh);
        }

        return mapToResponse(savedSach);
    }

    @Override
    public SachResponse update(Integer id, SachRequest request) {

        Sach sach = sachRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách"));

        TheLoai theLoai = theLoaiRepository.findById(request.getIdTheLoai())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thể loại"));

        NhaXuatBan nxb = nhaXuatBanRepository.findById(request.getIdNxb())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy NXB"));
        sach.setMaSach(request.getMaSach());
        sach.setMaVach(request.getMaVach());
        sach.setTenSach(request.getTenSach());
        sach.setTenSach(request.getTenSach());
        sach.setGiaBan(request.getGiaBan());
        sach.setSoLuong(request.getSoLuong());
        sach.setSoTrang(request.getSoTrang());
        sach.setNgonNgu(request.getNgonNgu());
        sach.setNamXuatBan(request.getNamXuatBan());
        sach.setKichThuoc(request.getKichThuoc());
        sach.setMoTa(request.getMoTa());
        sach.setTheLoai(theLoai);
        sach.setNhaXuatBan(nxb);
        sach.setNgayCapNhat(LocalDateTime.now());

        Sach savedSach = sachRepository.save(sach);

        if (request.getDuongDanAnh() != null && !request.getDuongDanAnh().isBlank()) {

            List<SachHinhAnh> dsAnh = sachHinhAnhRepository.findBySachId(id);

            if (!dsAnh.isEmpty()) {
                SachHinhAnh anh = dsAnh.get(0);
                anh.setDuongDan(request.getDuongDanAnh());
                sachHinhAnhRepository.save(anh);
            } else {
                SachHinhAnh hinhAnh = SachHinhAnh.builder()
                        .sach(savedSach)
                        .duongDan(request.getDuongDanAnh())
                        .laAnhChinh(true)
                        .ngayTao(LocalDateTime.now())
                        .build();

                sachHinhAnhRepository.save(hinhAnh);
            }
        }

        return mapToResponse(savedSach);
    }

    @Override
    public void hidden(Integer id) {
        Sach sach = sachRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách"));

        sach.setTrangThai(false);
        sach.setNgayCapNhat(LocalDateTime.now());

        sachRepository.save(sach);
    }

    @Override
    public List<SachResponse> search(String keyword) {
        return sachRepository.findByTenSachContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<SachResponse> findByTheLoai(Integer idTheLoai) {
        return sachRepository.findByTheLoai_Id(idTheLoai)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private SachResponse mapToResponse(Sach sach) {
        String duongDanAnh = sachHinhAnhRepository.findBySachId(sach.getId())
                .stream()
                .findFirst()
                .map(SachHinhAnh::getDuongDan)
                .orElse(null);
        return SachResponse.builder()
                .id(sach.getId())
                .maSach(sach.getMaSach())
                .maVach(sach.getMaVach())
                .tenSach(sach.getTenSach())
                .giaBan(sach.getGiaBan()) .
                soLuong(sach.getSoLuong())
                .soTrang(sach.getSoTrang())
                .ngonNgu(sach.getNgonNgu())
                .namXuatBan(sach.getNamXuatBan())
                .kichThuoc(sach.getKichThuoc())
                .moTa(sach.getMoTa())
                .idTheLoai(sach.getTheLoai().getId())
                .idNxb(sach.getNhaXuatBan().getId())
                .tenTheLoai(sach.getTheLoai().getTenTheLoai())
                .tenNxb(sach.getNhaXuatBan().getTenNxb())
                .duongDanAnh(duongDanAnh)
                .trangThai(sach.getTrangThai())
                .build();
    }
}

