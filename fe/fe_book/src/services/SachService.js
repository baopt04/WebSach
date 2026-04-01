import axiosClient from "./AxiosClient";

const SachService = {

    /** GET /api/sach — Lấy toàn bộ danh sách sách */
    getAll: () => {
        return axiosClient.get("/api/sach");
    },

    /** GET /api/sach/:id — Chi tiết sách */
    detail: (id) => {
        return axiosClient.get(`/api/sach/${id}`);
    },

    /** POST /api/sach — Thêm sách mới */
    add: (data) => {
        return axiosClient.post("/api/sach", data);
    },

    /** PUT /api/sach/:id — Cập nhật sách */
    update: (id, data) => {
        return axiosClient.put(`/api/sach/${id}`, data);
    },

    /** DELETE /api/sach/:id — Ẩn sách (soft delete) */
    hidden: (id) => {
        return axiosClient.delete(`/api/sach/${id}`);
    },

    /** GET /api/sach/search?keyword=... — Tìm kiếm */
    search: (keyword) => {
        return axiosClient.get("/api/sach/search", {
            params: { keyword },
        });
    },

    /** GET /api/sach/the-loai/:idTheLoai — Lọc theo thể loại */
    findByTheLoai: (idTheLoai) => {
        return axiosClient.get(`/api/sach/the-loai/${idTheLoai}`);
    },
};

export default SachService;