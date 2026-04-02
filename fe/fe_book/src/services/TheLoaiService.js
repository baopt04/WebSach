import axiosClient from "./AxiosClient";

const TheLoaiService = {
  getAll: () => {
    return axiosClient.get("/api/the-loai");
  },
};

export default TheLoaiService

