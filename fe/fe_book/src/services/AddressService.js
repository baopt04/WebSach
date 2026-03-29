import axiosClient from "./AxiosClient";
import { handleError } from "./ErrorHandler";

const BASE = "/api/admin/v1/dia-chi";

export const getAllDiaChi = async () => {
    try {
        const res = await axiosClient.get(BASE);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getDiaChiByTaiKhoanId = async (idTaiKhoan) => {
    try {
        if (!idTaiKhoan) throw new Error("ID tài khoản không hợp lệ");

        const res = await axiosClient.get(`${BASE}/tai-khoan/${idTaiKhoan}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createDiaChi = async (data) => {
    try {
        const res = await axiosClient.post(`${BASE}/create`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateDiaChi = async (id, data) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.put(`${BASE}/update/${id}`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteDiaChi = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.delete(`${BASE}/delete/${id}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const setDefaultDiaChi = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.put(`${BASE}/${id}/set-default`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};