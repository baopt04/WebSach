import axiosClient from "./AxiosClient";
import { handleError } from "./ErrorHandler";

const BASE = "/api/admin/v1/sach";

export const getAllSach = async () => {
    try {
        const res = await axiosClient.get(BASE);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getSachById = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.get(`${BASE}/${id}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createSach = async (data) => {
    try {
        const res = await axiosClient.post(BASE, data, {
            headers: { "Content-Type": "application/json" }
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createSachMultipart = async (data, images) => {
    try {
        const formData = new FormData();

        Object.keys(data).forEach((key) => {
            formData.append(key, data[key]);
        });

        if (images && images.length > 0) {
            images.forEach((file) => {
                formData.append("images", file);
            });
        }

        const res = await axiosClient.post(BASE, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateSach = async (id, data) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.put(`${BASE}/${id}`, data, {
            headers: { "Content-Type": "application/json" }
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateSachMultipart = async (id, data, images) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const formData = new FormData();

        console.log("Dữ liệu cập nhật sản phẩm multipart:", data);
        Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
                console.log(`Thêm trường dữ liệu: ${key} =`, data[key]);
                formData.append(key, data[key]);
            }
        });

        if (images && images.length > 0) {
            images.forEach((file) => {
                formData.append("images", file);
            });
        }

        const res = await axiosClient.put(`${BASE}/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteSach = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.delete(`${BASE}/${id}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const searchSach = async (keyword) => {
    try {
        const res = await axiosClient.get(`${BASE}/search`, {
            params: { keyword }
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getSachByMaVach = async (maVach) => {
    try {
        const res = await axiosClient.get(`${BASE}/ma-vach/${maVach}`);
        return res.data;
    } catch (error) {
        const products = await searchSach(maVach);
        return Array.isArray(products) ? products[0] : (products?.data?.[0] || null);
    }
};

export const getSachByTheLoai = async (idTheLoai) => {
    try {
        const res = await axiosClient.get(`${BASE}/the-loai/${idTheLoai}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getSachImages = async (id) => {
    try {
        const res = await axiosClient.get(`${BASE}/${id}/images`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const addSachImages = async (id, images) => {
    try {
        const formData = new FormData();

        images.forEach((file) => {
            formData.append("images", file);
        });

        const res = await axiosClient.post(`${BASE}/${id}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteSachImage = async (sachId, imageId) => {
    try {
        const res = await axiosClient.delete(
            `${BASE}/${sachId}/images/${imageId}`
        );
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};