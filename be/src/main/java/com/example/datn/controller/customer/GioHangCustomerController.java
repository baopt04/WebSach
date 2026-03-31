package com.example.datn.controller.customer;

import com.example.datn.dto.request.giohang.GioHangRequest;
import com.example.datn.dto.response.giohang.GioHangResponse;
import com.example.datn.entity.TaiKhoan;
import com.example.datn.repository.TaiKhoanRepository;
import com.example.datn.service.CustomerGioHangService;
import com.example.datn.exception.AppException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/v1/gio-hang")
public class GioHangCustomerController {

    @Autowired
    private CustomerGioHangService customerGioHangService;

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    private Integer getCustomerId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return taiKhoanRepository.findByEmail(email)
                .map(TaiKhoan::getId)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Không tìm thấy tài khoản hoặc chưa đăng nhập"));
    }

    @GetMapping
    public ResponseEntity<GioHangResponse> getCartDetails() {
        return ResponseEntity.ok(customerGioHangService.getCartDetails(getCustomerId()));
    }

    @PostMapping("/them")
    public ResponseEntity<String> addCartItem(@RequestBody GioHangRequest request) {
        return ResponseEntity.ok(customerGioHangService.addCartItem(getCustomerId(), request));
    }

    @PutMapping("/cap-nhat/{id}")
    public ResponseEntity<String> updateQuantity(@PathVariable Integer id, @RequestParam Integer quantity) {
        return ResponseEntity.ok(customerGioHangService.updateQuantity(getCustomerId(), id, quantity));
    }

    @DeleteMapping("/xoa/{id}")
    public ResponseEntity<String> removeCartItem(@PathVariable Integer id) {
        return ResponseEntity.ok(customerGioHangService.removeCartItem(getCustomerId(), id));
    }
}
