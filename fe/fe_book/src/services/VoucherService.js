import axiosClient from "./AxiosClient";
import { handleError } from "./ErrorHandler";

const BASE = "/api/admin/v1/ma-giam-gia";

export const getAllVoucher = async () => {
    try {
        const res = await axiosClient.get(BASE);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getVoucherId = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.get(`${BASE}/${id}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createVoucher = async (data) => {
    try {
        const res = await axiosClient.post(`${BASE}/create`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateVoucher = async (id, data) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.put(`${BASE}/update/${id}`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getValidVouchers = async (totalAmount) => {
    try {
        const res = await axiosClient.get("/api/customer/v1/ma-giam-gia/hop-le", {
            params: { tongTien: totalAmount }
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const searchVoucher = async (keyword) => {
    try {
        const res = await axiosClient.get(`${BASE}/search`, {
            params: { keyword },
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};