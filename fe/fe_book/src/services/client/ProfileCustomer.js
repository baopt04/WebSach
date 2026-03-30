import axiosClient from "../AxiosClient";
import { handleError } from "../ErrorHandler";

const BASE = "/api/customer/v1";

export const getMyAddresses = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/dia-chi`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createMyAddress = async (data) => {
    try {
        const res = await axiosClient.post(`${BASE}/dia-chi/create`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateMyAddress = async (id, data) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.put(`${BASE}/dia-chi/update/${id}`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteMyAddress = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.delete(`${BASE}/dia-chi/delete/${id}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const setDefaultAddress = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.put(`${BASE}/dia-chi/${id}/set-default`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};
export const getMyOrders = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/don-hang`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getMyOrderDetail = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.get(`${BASE}/don-hang/${id}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getMyProfile = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/profile`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateMyProfile = async (data) => {
    try {
        const res = await axiosClient.put(`${BASE}/profile/update`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const changePassword = async (data) => {
    try {
        const res = await axiosClient.put(`${BASE}/doi-mat-khau`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getMySearchOrder = async (numberPhone, code) => {
    try {
        const res = await axiosClient.get(`${BASE}/don-hang/search`, {
            params: {
                soDienThoai: numberPhone,
                maHoaDon: code
            }
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};