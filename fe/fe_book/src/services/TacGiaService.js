import axiosClient from "./AxiosClient";
import { handleError } from "./ErrorHandler";

const BASE = "/api/admin/v1/tac-gia";

export const getAllTacGia = async () => {
    try {
        const res = await axiosClient.get(BASE);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getTacGiaById = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.get(`${BASE}/${id}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createTacGia = async (data) => {
    try {
        const res = await axiosClient.post(`${BASE}/create`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateTacGia = async (id, data) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.put(`${BASE}/update/${id}`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteTacGia = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.delete(`${BASE}/delete/${id}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};