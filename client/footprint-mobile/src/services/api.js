import axios from "axios";
import { getToken } from "./tokenService";

const api = axios.create({
  baseURL: "http://192.168.4.23:3000/user",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
