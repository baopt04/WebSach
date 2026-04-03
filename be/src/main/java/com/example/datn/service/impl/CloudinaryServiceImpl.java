package com.example.datn.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.datn.exception.AppException;
import com.example.datn.service.CloudinaryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryServiceImpl(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret
    ) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    @Override
    @SuppressWarnings("rawtypes")
    public List<String> uploadImages(List<MultipartFile> images, String folder) {
        if (images == null || images.isEmpty()) {
            return List.of();
        }

        List<String> urls = new ArrayList<>();
        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) {
                continue;
            }

            try {
                Map params = ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "image"
                );

                Map result = cloudinary.uploader().upload(image.getBytes(), params);

                Object secureUrlObj = result.get("secure_url");
                Object urlObj = result.get("url");
                String url = secureUrlObj != null ? secureUrlObj.toString() : (urlObj != null ? urlObj.toString() : null);

                if (url == null || url.isBlank()) {
                    throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Cloudinary upload trả về URL rỗng");
                }
                urls.add(url);
            } catch (IOException e) {
                log.error("Upload image to Cloudinary failed", e);
                throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể đọc file ảnh để upload Cloudinary");
            } catch (AppException e) {
                throw e;
            } catch (Exception e) {
                log.error("Upload image to Cloudinary failed (unexpected)", e);
                throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload ảnh lên Cloudinary thất bại");
            }
        }

        return urls;
    }

    @Override
    public boolean deleteImageByUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return false;
        }

        String publicId = extractPublicIdFromUrl(imageUrl);
        if (publicId == null || publicId.isBlank()) {
            return false;
        }

        try {
            Map<?, ?> params = ObjectUtils.asMap("resource_type", "image");
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, params);
            Object resObj = result.get("result");
            return resObj != null;
        } catch (Exception e) {
            log.warn("Delete Cloudinary image failed: {}", e.getMessage());
            return false;
        }
    }

    private String extractPublicIdFromUrl(String url) {
        String marker = "/image/upload/";
        int idx = url.indexOf(marker);
        if (idx < 0) {
            marker = "/upload/";
            idx = url.indexOf(marker);
        }
        if (idx < 0) {
            return null;
        }

        String after = url.substring(idx + marker.length()); // v.../folder/name.ext
        if (after.isBlank()) {
            return null;
        }

        String[] parts = after.split("/");
        int start = 0;
        if (parts.length > 0 && Pattern.matches("v\\d+", parts[0])) {
            start = 1;
        }
        if (start >= parts.length) {
            return null;
        }

        String folderAndFile = String.join("/", java.util.Arrays.copyOfRange(parts, start, parts.length));
        int dotIdx = folderAndFile.lastIndexOf('.');
        if (dotIdx > 0) {
            folderAndFile = folderAndFile.substring(0, dotIdx);
        }
        return folderAndFile;
    }
}

