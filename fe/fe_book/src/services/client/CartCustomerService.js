import axiosClient from "../AxiosClient";
import { handleError } from "../ErrorHandler";

const BASE = "/api/customer/v1/gio-hang";


export const getCartDetails = async () => {
    try {
        const res = await axiosClient.get(BASE);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const addCartItem = async (data) => {
    try {
        if (!data) throw new Error("Dữ liệu không hợp lệ");

        const res = await axiosClient.post(`${BASE}/them`, data);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateCartItem = async (id, quantity) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");
        if (quantity <= 0) throw new Error("Số lượng phải lớn hơn 0");

        const res = await axiosClient.put(`${BASE}/cap-nhat/${id}`, null, {
            params: { quantity },
        });

        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

/**
 * 🔹 Xóa sản phẩm khỏi giỏ hàng
 */
export const removeCartItem = async (id) => {
    try {
        if (!id) throw new Error("ID không hợp lệ");

        const res = await axiosClient.delete(`${BASE}/xoa/${id}`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};