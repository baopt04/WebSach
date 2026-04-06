import axiosClient from "../AxiosClient";
import { handleError } from "../ErrorHandler";
const BASE = "/api/customer/v1/ma-giam-gia";

export const getEligibleVouchers = async (tongTien) => {
    try {
        if (tongTien === null || tongTien === undefined) {
            throw new Error("Tổng tiền không hợp lệ");
        }

        const res = await axiosClient.get(`${BASE}/hop-le`, {
            params: { tongTien },
        });

        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};