package com.example.datn.controller;




import com.example.datn.dto.SachHinhAnhDTO;
import com.example.datn.dto.request.SachRequest;
import com.example.datn.dto.response.SachResponse;
import com.example.datn.service.SachService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/v1/sach")
@RequiredArgsConstructor
public class SachController {

    private final SachService sachService;

    @GetMapping
    public List<SachResponse> getAll() {
        return sachService.getAll();
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public SachResponse add(@Valid @RequestBody SachRequest request) {
        return sachService.add(request);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SachResponse addMultipart(
            @Valid @ModelAttribute SachRequest request,
            @RequestParam(value = "images", required = false) List<MultipartFile> images
    ) {
        return sachService.add(request, images);
    }
    @GetMapping("/{id}")
    public SachResponse detail(@PathVariable Integer id) {
        return sachService.detail(id);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SachResponse update(@PathVariable Integer id,
                               @Valid @RequestBody SachRequest request) {
        return sachService.update(id, request);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SachResponse updateMultipart(
            @PathVariable Integer id,
            @Valid @ModelAttribute SachRequest request,
            @RequestParam(value = "images", required = false) List<MultipartFile> images
    ) {
        return sachService.update(id, request, images);
    }

    @GetMapping("/{id}/images")
    public List<SachHinhAnhDTO> getImages(@PathVariable Integer id) {
        return sachService.getImages(id);
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SachResponse addImages(
            @PathVariable Integer id,
            @RequestParam(value = "images") List<MultipartFile> images
    ) {
        return sachService.addImages(id, images);
    }

    @DeleteMapping("/{sachId}/images/{imageId}")
    public String deleteImage(
            @PathVariable Integer sachId,
            @PathVariable Integer imageId
    ) {
        sachService.deleteImage(sachId, imageId);
        return "Xóa ảnh sách thành công";
    }

    @DeleteMapping("/{id}")
    public String hidden(@PathVariable Integer id) {
        sachService.hidden(id);
        return "Ẩn sách thành công";
    }
    @GetMapping("/search")
    public List<SachResponse> search(@RequestParam String keyword) {
        return sachService.search(keyword);
    }

    @GetMapping("/the-loai/{idTheLoai}")
    public List<SachResponse> findByTheLoai(@PathVariable Integer idTheLoai) {
        return sachService.findByTheLoai(idTheLoai);
    }


}
