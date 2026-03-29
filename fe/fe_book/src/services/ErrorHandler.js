export const handleError = (error) => {
    if (error.response && error.response.data) {
        return {
            message: error.response.data.message || "Lỗi server",
            status: error.response.data.status,
            error: error.response.data.error,
            timestamp: error.response.data.timestamp,
        };
    }

    if (error.request) {
        return {
            message: "Không thể kết nối đến server",
            status: 0,
        };
    }

    return {
        message: error.message,
        status: -1,
    };
};