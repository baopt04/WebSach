import axiosClient from "./AxiosClient";
import { handleError } from "./ErrorHandler";

const BASE = "/api/admin/v1/pos-quay";


export const getAllHoaDon = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/hoa-don`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createHoaDon = async () => {
    try {
        const res = await axiosClient.post(`${BASE}/hoa-don/trong`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const getAllKhachHang = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/khach-hang/lien-he`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createKhachHangNhanh = async (data) => {
    try {
        const res = await axiosClient.post(`${BASE}/khach-hang/nhanh`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const getSachByMaVach = async (maVach) => {
    try {
        if (!maVach) throw new Error("Mã vạch không hợp lệ");

        const res = await axiosClient.get(`${BASE}/san-pham/theo-ma-vach`, {
            params: { maVach }
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const addSachToHoaDon = async (idHoaDon, data) => {
    try {
        if (!idHoaDon) throw new Error("ID hóa đơn không hợp lệ");

        const res = await axiosClient.post(
            `${BASE}/hoa-don/${idHoaDon}/them-sach`,
            data
        );
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteChiTietHoaDon = async (idHoaDon, idChiTiet) => {
    try {
        if (!idHoaDon || !idChiTiet)
            throw new Error("ID không hợp lệ");

        const res = await axiosClient.delete(
            `${BASE}/hoa-don/${idHoaDon}/chi-tiet/${idChiTiet}`
        );
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const giamSoLuongChiTiet = async (idHoaDon, idChiTiet, soLuongGiam) => {
    try {
        if (!idHoaDon || !idChiTiet) throw new Error("ID không hợp lệ");
        if (!soLuongGiam || soLuongGiam < 1) throw new Error("soLuongGiam phải >= 1");

        const res = await axiosClient.post(
            `${BASE}/hoa-don/${idHoaDon}/chi-tiet/${idChiTiet}/giam-so-luong`,
            { soLuongGiam }
        );
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const thanhToanHoaDon = async (idHoaDon, data = {}) => {
    try {
        if (!idHoaDon) throw new Error("ID hóa đơn không hợp lệ");

        const res = await axiosClient.post(
            `${BASE}/hoa-don/${idHoaDon}/thanh-toan`,
            data
        );
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};