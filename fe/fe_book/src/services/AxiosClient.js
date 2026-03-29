import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export default axiosClient;