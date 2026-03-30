package com.example.datn.controller.customer;

import com.example.datn.dto.request.CapNhatThongTinRequest;
import com.example.datn.dto.request.DiaChiCustomerRequest;
import com.example.datn.dto.request.DoiMatKhauRequest;
import com.example.datn.dto.response.DiaChiResponse;
import com.example.datn.dto.response.HoaDonCustomerSummaryResponse;
import com.example.datn.dto.response.HoaDonDetailResponse;
import com.example.datn.dto.response.TaiKhoanResponse;
import com.example.datn.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/v1")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/dia-chi")
    public ResponseEntity<List<DiaChiResponse>> getMyAddresses() {
        return ResponseEntity.ok(customerService.getMyAddresses());
    }

    @PostMapping("/dia-chi/create")
    public ResponseEntity<DiaChiResponse> createMyAddress(@Valid @RequestBody DiaChiCustomerRequest request) {
        return new ResponseEntity<>(customerService.createMyAddress(request), HttpStatus.CREATED);
    }


    @PutMapping("/dia-chi/update/{id}")
    public ResponseEntity<DiaChiResponse> updateMyAddress(
            @PathVariable Integer id,
            @Valid @RequestBody DiaChiCustomerRequest request) {
        return ResponseEntity.ok(customerService.updateMyAddress(id, request));
    }


    @DeleteMapping("/dia-chi/delete/{id}")
    public ResponseEntity<String> deleteMyAddress(@PathVariable Integer id) {
        customerService.deleteMyAddress(id);
        return ResponseEntity.ok("Xóa địa chỉ thành công!");
    }


    @PutMapping("/dia-chi/{id}/set-default")
    public ResponseEntity<String> setDefaultAddress(@PathVariable Integer id) {
        customerService.setDefaultAddress(id);
        return ResponseEntity.ok("Đặt địa chỉ mặc định thành công!");
    }

    @GetMapping("/don-hang")
    public ResponseEntity<List<HoaDonCustomerSummaryResponse>> getMyOrders() {
        return ResponseEntity.ok(customerService.getMyOrders());
    }

    @GetMapping("/don-hang/{id}")
    public ResponseEntity<HoaDonDetailResponse> getMyOrderDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(customerService.getMyOrderDetail(id));
    }

    @GetMapping("/don-hang/search")
    public ResponseEntity<HoaDonDetailResponse> searchHoaDon(
            @RequestParam String soDienThoai,
            @RequestParam String maHoaDon) {
        return ResponseEntity.ok(customerService.searchHoaDonByPhoneAndCode(soDienThoai, maHoaDon));
    }

    @GetMapping("/profile")
    public ResponseEntity<TaiKhoanResponse> getMyProfile() {
        return ResponseEntity.ok(customerService.getMyProfile());
    }

    @PutMapping("/profile/update")
    public ResponseEntity<TaiKhoanResponse> updateMyProfile(
            @Valid @RequestBody CapNhatThongTinRequest request) {
        return ResponseEntity.ok(customerService.updateMyProfile(request));
    }


    @PutMapping("/doi-mat-khau")
    public ResponseEntity<String> doiMatKhau(@Valid @RequestBody DoiMatKhauRequest request) {
        customerService.doiMatKhau(request);
        return ResponseEntity.ok("Đổi mật khẩu thành công!");
    }
}
