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

function extractError(error) {
  return error.response?.data?.err || error.response?.data?.error || error.message || "Something went wrong.";
}

export async function getAllCountries() {
  try {
    const response = await coreApi.get("/country");
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}
