//package com.example.datn.service.impl;
//
//import com.example.datn.entity.TaiKhoan;
//import com.example.datn.repository.TaiKhoanRepository;
//import com.example.datn.service.TaiKhoanService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class TaiKhoanServiceImpl implements TaiKhoanService{
//    private final TaiKhoanRepository taiKhoanRepository;
//
//    @Override
//    public List<TaiKhoan> getAll() {
//        return taiKhoanRepository.findAll();
//    }
//
//    @Override
//    public TaiKhoan getById(Integer id) {
//        return taiKhoanRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
//    }
//
//    @Override
//    public TaiKhoan create(TaiKhoan taiKhoan) {
//        return taiKhoanRepository.save(taiKhoan);
//    }
//
//    @Override
//    public TaiKhoan update(Integer id, TaiKhoan taiKhoan) {
//
//        TaiKhoan tk = getById(id);
//
//        tk.setHoTen(taiKhoan.getHoTen());
//        tk.setEmail(taiKhoan.getEmail());
//        tk.setSoDienThoai(taiKhoan.getSoDienThoai());
//        tk.setDiaChi(taiKhoan.getDiaChi());
//        tk.setTrangThai(taiKhoan.getTrangThai());
//
//        return taiKhoanRepository.save(tk);
//    }
//
//    @Override
//    public void delete(Integer id) {
//        taiKhoanRepository.deleteById(id);
//    }
//}
