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
  return error.response?.data?.err || error.message || "Something went wrong.";
}

export async function getTripById(id) {
  try {
    const response = await coreApi.get(`/trip/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function getTripsByUser(userId) {
  try {
    const response = await coreApi.get(`/trip/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function createTrip(tripData) {
  try {
    const response = await coreApi.post("/trip", tripData);
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function updateTrip(tripId, updates) {
  try {
    const response = await coreApi.patch(`/trip/${tripId}`, updates);
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function addTripImage(tripId, imageAsset) {
  try {
    const formData = new FormData();
    formData.append("image", {
      uri: imageAsset.uri,
      type: imageAsset.mimeType || "image/jpeg",
      name: imageAsset.fileName || "photo.jpg",
    });
    const response = await coreApi.post(`/trip/${tripId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}
