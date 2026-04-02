import axiosClient from "./AxiosClient";
import { handleError } from "./ErrorHandler";

const BASE = "/api/admin/v1/hoa-don";

export const getAllHoaDon = async () => {
    try {
        const res = await axiosClient.get(BASE);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getHoaDonChiTiet = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.get(`${BASE}/chi-tiet/${id}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getLichSuHoaDon = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.get(`${BASE}/lich-su-hoa-don/${id}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const changeOrderStatus = async (id, data) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.put(
            `${BASE}/chuyen-trang-thai/${id}`,
            data
        );
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateHoaDon = async (id, data) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.put(
            `${BASE}/cap-nhat-don-hang/${id}`,
            data
        );
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const searchHoaDon = async (keyword) => {
    try {
        const res = await axiosClient.get(`${BASE}/search-text`, {
            params: { keyword },
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const searchHoaDonByDate = async (tuNgay, denNgay) => {
    try {
        const res = await axiosClient.get(`${BASE}/search-date`, {
            params: { tuNgay, denNgay },
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};
export const syntheticHoaDon = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/tong-hop`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};
