//package com.example.datn.controller;
//
//import com.example.datn.entity.TaiKhoan;
//import com.example.datn.service.TaiKhoanService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.web.bind.annotation.*;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/taikhoan")
//@RequiredArgsConstructor
//public class TaiKhoanController {
//    private final TaiKhoanService taiKhoanService;
//
//    //Lấy danh sách tài khoản
//    @GetMapping
//    public List<TaiKhoan> getAll() {
//        return taiKhoanService.getAll();
//    }
//
//    //Lấy tài khoản theo id
//    @GetMapping("/{id}")
//    public TaiKhoan getById(@PathVariable Integer id) {
//        return taiKhoanService.getById(id);
//    }
//
//    //Thêm tài khoản
//    @PostMapping
//    public TaiKhoan create(@RequestBody TaiKhoan taiKhoan) {
//        return taiKhoanService.create(taiKhoan);
//    }
//
//    //Cập nhật
//    @PutMapping("/{id}")
//    public TaiKhoan update(@PathVariable Integer id,
//                           @RequestBody TaiKhoan taiKhoan) {
//        return taiKhoanService.update(id, taiKhoan);
//    }
//
//    //Xóa
//    @DeleteMapping("/{id}")
//    public String delete(@PathVariable Integer id) {
//        taiKhoanService.delete(id);
//        return "Xóa thành công";
//    }
//}
