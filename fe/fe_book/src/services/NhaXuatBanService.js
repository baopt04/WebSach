import axiosClient from "./AxiosClient";
import { handleError } from "./ErrorHandler";

const BASE = "/api/admin/v1/nha-xuat-ban";

export const getAllNhaXuatBan = async () => {
  try {
    const res = await axiosClient.get(BASE);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getNhaXuatBanById = async (id) => {
  try {
    if (!id) throw new Error("ID không hợp lệ");

    const res = await axiosClient.get(`${BASE}/${id}`);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const createNhaXuatBan = async (data) => {
  try {
    const res = await axiosClient.post(`${BASE}/create`, data);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateNhaXuatBan = async (id, data) => {
  try {
    if (!id) throw new Error("ID không hợp lệ");

    const res = await axiosClient.put(`${BASE}/update/${id}`, data);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteNhaXuatBan = async (id) => {
  try {
    if (!id) throw new Error("ID không hợp lệ");

    const res = await axiosClient.delete(`${BASE}/delete/${id}`);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};