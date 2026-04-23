import api from "./api";

function extractError(error) {
  if (error.response?.data?.err) return error.response.data.err;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response?.data?.message) return error.response.data.message;
  return error.message || "Something went wrong.";
}

export async function getProfile() {
  try {
    const response = await api.get("user/profile");
    return response.data.user;
  } catch (error) {
    throw new Error(extractError(error));
  }
}
export async function updateProfile(updates) {
  try {
    const response = await api.patch("user/profile/update", updates);
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}
