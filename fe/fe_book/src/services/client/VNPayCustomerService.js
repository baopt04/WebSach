import axiosClient from "../AxiosClient";
import { handleError } from "../ErrorHandler";

const BASE = "/api/payment";

export const createVnpayPaymentUrl = async (data) => {
  try {
    const res = await axiosClient.post(`${BASE}/payment-vnpay`, data);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const vnpayCallback = async (params) => {
  try {
    const res = await axiosClient.get(`${BASE}/vnpay-success`, { params });
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};
