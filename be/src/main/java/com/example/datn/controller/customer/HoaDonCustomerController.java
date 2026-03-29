package com.example.datn.controller.customer;

import com.example.datn.dto.request.HoaDonCreateRequest;
import com.example.datn.dto.request.TrangThaiHoaDonRequest;
import com.example.datn.dto.response.HoaDonResponse;
import com.example.datn.service.HoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/v1/hoa-don")
@RequiredArgsConstructor
//@CrossOrigin("*")
public class HoaDonCustomerController {

    private final HoaDonService hoaDonService;

    @PostMapping("/tao-don")
    public ResponseEntity<HoaDonResponse> createHoaDonKhachHang(@RequestBody HoaDonCreateRequest request) {
        return ResponseEntity.ok(hoaDonService.createHoaDonKhachHang(request));
    }

    @PutMapping("/huy-don/{id}")
    public ResponseEntity<String> clientCancelOrder(
            @PathVariable("id") Integer id,
            @RequestBody TrangThaiHoaDonRequest request) {
        return ResponseEntity.ok(hoaDonService.clientCancelOrder(id, request));
    }
}
