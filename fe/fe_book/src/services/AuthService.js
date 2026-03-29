import axiosClient from "./AxiosClient";
import { handleError } from "./ErrorHandler";

export const login = async (email, matKhau) => {
    try {
        const res = await axiosClient.post("/api/auth/login", { email, matKhau });
        return res.data;
    } catch (error) {
        throw handleError(error);
    }
};
