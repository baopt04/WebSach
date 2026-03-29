import axiosClient from "../AxiosClient";
import { handleError } from "../ErrorHandler";

const BASE = "/api/customer/v1/san-pham";

export const getAllSanPham = async () => {
    try {
        const res = await axiosClient.get(`${BASE}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getAllTacGia = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/tac-gia`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getSanPhamByTacGia = async (idTacGia) => {
    try {
        if (!idTacGia) throw new Error("ID tác giả không hợp lệ");
        const res = await axiosClient.get(`${BASE}/tac-gia/${idTacGia}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getSanPhamBanChay = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/ban-chay`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getSanPhamMoiNhat = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/moi-nhat`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getChiTietSanPham = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.get(`${BASE}/chi-tiet/${id}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const validateSoLuongSanPham = async (id, quantity) => {
    try {
        if (!id || quantity == null) throw new Error("ID hoặc số lượng không hợp lệ");

        const res = await axiosClient.get(`${BASE}/kiem-tra-so-luong`, {
            params: { id, quantity },
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};
export const getAllTheLoai = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/the-loai`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getSanPhamByTheLoai = async (idTheLoai) => {
    try {
        if (!idTheLoai) throw new Error("ID thể loại không hợp lệ");

        const res = await axiosClient.get(`${BASE}/the-loai/${idTheLoai}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};



export const getAllNhaXuatBan = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/nha-xuat-ban`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getSanPhamByNhaXuatBan = async (idNhaXuatBan) => {
    try {
        if (!idNhaXuatBan) throw new Error("ID nhà xuất bản không hợp lệ");

        const res = await axiosClient.get(`${BASE}/nha-xuat-ban/${idNhaXuatBan}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};