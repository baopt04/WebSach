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

export const getTotalCancelledOrders = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/tong-don-huy`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getTop10BestSellingBooks = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/top-sach-ban-chay`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

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

export const getSummaryStatistics = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/tong-hop`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getDonHangGanNhat = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/don-hang-gan-nhat`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getTongSanPhamHoatDong = async () => {
    try {
        const res = await axiosClient.get(`${BASE}/tong-san-pham-hoat-dong`);
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const getSoDonTheoTrangThaiTheoNgay = async (ngay) => {
    try {
        const params = ngay ? { ngay } : {};
        const res = await axiosClient.get(`${BASE}/so-don-theo-trang-thai-ngay`, { params });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};
