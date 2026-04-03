import axiosClient from "./AxiosClient";
import { handleError } from "./ErrorHandler";

const BASE = "/api/admin/v1/sach-tac-gia";

export const getTacGiaBySach = async (idSach) => {
    try {
        if (!idSach) throw new Error("ID sách không hợp lệ");

        const res = await axiosClient.get(`${BASE}/sach/${idSach}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getSachTacGiaDetail = async (idSach, idTacGia) => {
    try {
        if (!idSach || !idTacGia) throw new Error("ID không hợp lệ");

        const res = await axiosClient.get(`${BASE}/${idSach}/${idTacGia}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createSachTacGia = async (data) => {
    try {
        const res = await axiosClient.post(`${BASE}/create`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateSachTacGia = async (idSach, idTacGia, data) => {
    try {
        if (!idSach || !idTacGia) throw new Error("ID không hợp lệ");

        const res = await axiosClient.put(
            `${BASE}/update/${idSach}/${idTacGia}`,
            data
        );
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteSachTacGia = async (idSach, idTacGia) => {
    try {
        if (!idSach || !idTacGia) throw new Error("ID không hợp lệ");

        const res = await axiosClient.delete(
            `${BASE}/delete/${idSach}/${idTacGia}`
        );
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};