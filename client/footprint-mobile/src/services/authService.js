import axios from "axios";
import { saveToken, removeToken } from "./tokenService";

const API = axios.create({
  baseURL: "https://footprint-mobile-app.onrender.com/user",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 50000,
});

function extractError(error) {
  if (error.response?.data?.err) {
    return error.response.data.err;
  }

  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  return error.message || "Something went wrong.";
}

export async function registerUser(user) {
  try {
    const response = await API.post("/register", user);
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function loginUser(email, password) {
  try {
    const response = await API.post("/login", {
      email,
      password,
    });

    const token = response.data.token;

    if (token) {
      await saveToken(token);
    }

    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function logoutUser() {
  await removeToken();
}
