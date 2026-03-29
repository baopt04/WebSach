import axiosClient from "./AxiosClient";
import { handleError } from "./ErrorHandler";

const BASE = "/api/admin/v1/tai-khoan";

export const getAllTaiKhoan = async () => {
    try {
        const res = await axiosClient.get(BASE);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getTaiKhoanById = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.get(`${BASE}/${id}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createTaiKhoan = async (data) => {
    try {
        const res = await axiosClient.post(`${BASE}/create`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateTaiKhoan = async (id, data) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.put(`${BASE}/update/${id}`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteTaiKhoan = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.delete(`${BASE}/delete/${id}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const searchTaiKhoan = async (keyword) => {
    try {
        const res = await axiosClient.get(`${BASE}/search`, {
            params: { keyword },
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};