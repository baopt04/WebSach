import axiosClient from "./AxiosClient";
import { handleError } from "./ErrorHandler";

const BASE = "/api/admin/v1/thong-ke";

export const getTotalOrders = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/tong-don-hang`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getTotalRevenue = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/tong-doanh-thu`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getRevenueByMonth = async (month, year) => {
    try {
        const res = await axiosClient.get(`${BASE}/doanh-thu-thang`, {
            params: { month, year },
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Tổng đơn hàng theo tháng
export const getTotalOrdersByMonth = async (month, year) => {
    try {
        const res = await axiosClient.get(`${BASE}/tong-don-hang-thang`, {
            params: { month, year },
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Tổng đơn hủy
export const getTotalCancelledOrders = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/tong-don-huy`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Top sách bán chạy
export const getTop10BestSellingBooks = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/top-sach-ban-chay`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Doanh thu theo từng tháng trong năm
export const getRevenueAndOrdersByMonths = async (year) => {
    try {
        const res = await axiosClient.get(`${BASE}/doanh-thu-theo-thang`, {
            params: { year },
        });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Tổng hợp đơn hàng và doanh thu
export const getSummaryStatistics = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/tong-hop`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};
