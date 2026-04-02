import axiosClient from "./AxiosClient";

const NhaXuatBanService = {
  getAll: () => {
    return axiosClient.get("/api/nha-xuat-ban");
  },
};

export default NhaXuatBanService;

