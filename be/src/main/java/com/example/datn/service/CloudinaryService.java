package com.example.datn.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CloudinaryService {
    List<String> uploadImages(List<MultipartFile> images, String folder);

    /**
     * Xóa ảnh khỏi Cloudinary theo URL (best-effort).
     * Trả về true nếu parse và gọi destroy thành công.
     */
    boolean deleteImageByUrl(String imageUrl);
}

