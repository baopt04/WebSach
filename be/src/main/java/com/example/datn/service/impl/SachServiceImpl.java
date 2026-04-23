package com.example.datn.service.impl;

import com.example.datn.exception.AppException;
import com.example.datn.dto.SachHinhAnhDTO;
import com.example.datn.dto.request.SachRequest;
import com.example.datn.dto.response.SachResponse;
import com.example.datn.entity.*;
import com.example.datn.repository.*;
import com.example.datn.service.CloudinaryService;
import com.example.datn.service.SachService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SachServiceImpl implements SachService {

    private final SachRepository sachRepository;
    private final TheLoaiRepository theLoaiRepository;
    private final NhaXuatBanRepository nhaXuatBanRepository;
    private final SachHinhAnhRepository sachHinhAnhRepository;
    private final CloudinaryService cloudinaryService;

    private static final String CLOUDINARY_FOLDER = "sach";
    private static final int MAX_IMAGE_COUNT = 5;

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
        String generatedMaSach= "MS" + String.format("%05d", new Random().nextInt(100000));
        String generatedMaVach =  new Random().nextInt(1000000) + 1000000 + "";
        Sach sach = Sach.builder()
                .maSach(generatedMaSach)
                .maVach(generatedMaVach)
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
    @Transactional
    public SachResponse add(SachRequest request, List<MultipartFile> images) {

        if (sachRepository.findByMaSach(request.getMaSach()).isPresent()) {
            throw new RuntimeException("Mã sách đã tồn tại");
        }

        if (images == null || images.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Phải gửi ảnh sách");
        }
        if (images.size() > MAX_IMAGE_COUNT) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không được gửi quá " + MAX_IMAGE_COUNT + " ảnh sách");
        }

        images.forEach(file -> {
            if (file == null || file.isEmpty()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Ảnh sách không được rỗng");
            }
            String contentType = file.getContentType();
            if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
                throw new AppException(HttpStatus.BAD_REQUEST, "File phải là ảnh");
            }
        });

        TheLoai theLoai = theLoaiRepository.findById(request.getIdTheLoai())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thể loại"));

        NhaXuatBan nxb = nhaXuatBanRepository.findById(request.getIdNxb())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy NXB"));
        String generatedMaSach= "MS" + String.format("%05d", new Random().nextInt(100000));
        String generatedMaVach =  new Random().nextInt(1000000) + 1000000 + "";
        Sach sach = Sach.builder()
                .maSach(generatedMaSach)
                .maVach(generatedMaVach)
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

        List<String> imageUrls = cloudinaryService.uploadImages(images, CLOUDINARY_FOLDER);
        if (imageUrls.size() != images.size()) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Cloudinary upload không đủ ảnh");
        }

        List<SachHinhAnh> hinhAnhs = new ArrayList<>();
        for (int i = 0; i < imageUrls.size(); i++) {
            hinhAnhs.add(SachHinhAnh.builder()
                    .sach(savedSach)
                    .duongDan(imageUrls.get(i))
                    .laAnhChinh(i == 0)
                    .ngayTao(LocalDateTime.now())
                    .build());
        }

        sachHinhAnhRepository.saveAll(hinhAnhs);
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
        sach.setTrangThai(request.getTrangThai());

        Sach savedSach = sachRepository.save(sach);

        if (request.getDuongDanAnh() != null && !request.getDuongDanAnh().isBlank()) {
            Optional<SachHinhAnh> mainImageOpt = sachHinhAnhRepository.findFirstBySach_IdAndLaAnhChinhTrue(id);
            if (mainImageOpt.isPresent()) {
                SachHinhAnh anh = mainImageOpt.get();
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
    @Transactional
    public SachResponse update(Integer id, SachRequest request, List<MultipartFile> images) {

        Sach sach = sachRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách"));

        TheLoai theLoai = theLoaiRepository.findById(request.getIdTheLoai())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thể loại"));

        NhaXuatBan nxb = nhaXuatBanRepository.findById(request.getIdNxb())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy NXB"));

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
        sach.setTrangThai(request.getTrangThai());
        Sach savedSach = sachRepository.save(sach);

        if (images != null && !images.isEmpty()) {
            List<SachHinhAnh> existingImages = sachHinhAnhRepository.findBySachId(id);
            int existingCount = existingImages != null ? existingImages.size() : 0;

            if (existingCount + images.size() > MAX_IMAGE_COUNT) {
                throw new AppException(HttpStatus.BAD_REQUEST,
                        "Tổng số ảnh của sách không được vượt quá " + MAX_IMAGE_COUNT);
            }

            images.forEach(file -> {
                if (file == null || file.isEmpty()) {
                    throw new AppException(HttpStatus.BAD_REQUEST, "Ảnh sách không được rỗng");
                }
                String contentType = file.getContentType();
                if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
                    throw new AppException(HttpStatus.BAD_REQUEST, "File phải là ảnh");
                }
            });

            List<String> imageUrls = cloudinaryService.uploadImages(images, CLOUDINARY_FOLDER);
            if (imageUrls.size() != images.size()) {
                throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Cloudinary upload không đủ ảnh");
            }

            boolean makeMain = existingCount == 0;

            List<SachHinhAnh> newImages = new ArrayList<>();
            for (int i = 0; i < imageUrls.size(); i++) {
                newImages.add(SachHinhAnh.builder()
                        .sach(savedSach)
                        .duongDan(imageUrls.get(i))
                        .laAnhChinh(makeMain && i == 0)
                        .ngayTao(LocalDateTime.now())
                        .build());
            }
            sachHinhAnhRepository.saveAll(newImages);
        } else if (request.getDuongDanAnh() != null && !request.getDuongDanAnh().isBlank()) {
            Optional<SachHinhAnh> mainImageOpt = sachHinhAnhRepository.findFirstBySach_IdAndLaAnhChinhTrue(id);
            if (mainImageOpt.isPresent()) {
                SachHinhAnh anh = mainImageOpt.get();
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
    public List<SachHinhAnhDTO> getImages(Integer sachId) {
        List<SachHinhAnh> list = sachHinhAnhRepository.findBySachId(sachId);
        if (list == null || list.isEmpty()) {
            return Collections.emptyList();
        }
        return list.stream()
                .map(img -> SachHinhAnhDTO.builder()
                        .id(img.getId())
                        .duongDan(img.getDuongDan())
                        .laAnhChinh(img.getLaAnhChinh())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public SachResponse addImages(Integer sachId, List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Phải gửi ảnh sách");
        }
        if (images.size() > MAX_IMAGE_COUNT) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không được gửi quá " + MAX_IMAGE_COUNT + " ảnh");
        }

        Sach sach = sachRepository.findById(sachId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách"));

        List<SachHinhAnh> existingImages = sachHinhAnhRepository.findBySachId(sachId);
        int existingCount = existingImages == null ? 0 : existingImages.size();

        if (existingCount + images.size() > MAX_IMAGE_COUNT) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Tổng số ảnh của sách không được vượt quá " + MAX_IMAGE_COUNT);
        }

        images.forEach(file -> {
            if (file == null || file.isEmpty()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Ảnh sách không được rỗng");
            }
            String contentType = file.getContentType();
            if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
                throw new AppException(HttpStatus.BAD_REQUEST, "File phải là ảnh");
            }
        });

        List<String> imageUrls = cloudinaryService.uploadImages(images, CLOUDINARY_FOLDER);
        if (imageUrls.size() != images.size()) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Cloudinary upload không đủ ảnh");
        }

        boolean makeMain = existingCount == 0;
        List<SachHinhAnh> newImages = new ArrayList<>();
        for (int i = 0; i < imageUrls.size(); i++) {
            newImages.add(SachHinhAnh.builder()
                    .sach(sach)
                    .duongDan(imageUrls.get(i))
                    .laAnhChinh(makeMain && i == 0)
                    .ngayTao(LocalDateTime.now())
                    .build());
        }

        sachHinhAnhRepository.saveAll(newImages);
        return mapToResponse(sach);
    }

    @Override
    @Transactional
    public void deleteImage(Integer sachId, Integer imageId) {
        SachHinhAnh img = sachHinhAnhRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh"));
        if (img.getSach() == null || !img.getSach().getId().equals(sachId)) {
            throw new RuntimeException("Ảnh không thuộc sách này");
        }

        boolean wasMain = Boolean.TRUE.equals(img.getLaAnhChinh());
        String duongDan = img.getDuongDan();

        // Xóa khỏi DB
        sachHinhAnhRepository.delete(img);

        // Best-effort xóa trên Cloudinary
        if (duongDan != null && !duongDan.isBlank()) {
            cloudinaryService.deleteImageByUrl(duongDan);
        }

        // Nếu ảnh chính bị xóa thì chọn ảnh còn lại làm ảnh chính
        if (wasMain) {
            List<SachHinhAnh> remaining = sachHinhAnhRepository.findBySachId(sachId);
            if (remaining != null && !remaining.isEmpty()) {
                SachHinhAnh newMain = remaining.get(0);
                newMain.setLaAnhChinh(true);
                sachHinhAnhRepository.save(newMain);
            }
        }
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
        List<SachHinhAnh> dsAnh = sachHinhAnhRepository.findBySachId(sach.getId());
        String duongDanAnh = sachHinhAnhRepository.findFirstBySach_IdAndLaAnhChinhTrue(sach.getId())
                .map(SachHinhAnh::getDuongDan)
                .orElse(null);
        List<String> hinhAnhs = dsAnh.stream()
                .map(SachHinhAnh::getDuongDan)
                .toList();
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
                .hinhAnhs(hinhAnhs)
                .trangThai(sach.getTrangThai())
                .ngayCapNhat(sach.getNgayCapNhat())
                .build();
    }
}

