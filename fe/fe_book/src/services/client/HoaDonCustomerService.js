import axiosClient from "../AxiosClient";
import { handleError } from "../ErrorHandler";

const BASE = "/api/customer/v1/hoa-don";

export const createHoaDon = async (data) => {
    try {
        const res = await axiosClient.post(`${BASE}/tao-don`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const cancelHoaDon = async (id, data) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.put(
            `${BASE}/huy-don/${id}`,
            data
        );
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateHoaDonInfo = async (id, data) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");
        const res = await axiosClient.put(`/api/admin/v1/hoa-don/cap-nhat-don-hang/${id}`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};