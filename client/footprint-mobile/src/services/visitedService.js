import axios from "axios";
import { getToken } from "./tokenService";

const coreApi = axios.create({
  baseURL: "https://footprint-mobile-app.onrender.com",
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

coreApi.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

export async function getVisitedByUser(userId) {
  try {
    const response = await coreApi.get(`/visited/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.err || "Failed to fetch visited locations");
  }
}