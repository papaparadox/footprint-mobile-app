import api from "./api";

function extractError(error) {
  if (error.response?.data?.err) {
    return error.response.data.err;
  }

  return error.message || "Something went wrong.";
}

export async function getProfile() {
  try {
    const response = await api.get("/profile");
    return response.data.user;
  } catch (error) {
    throw new Error(extractError(error));
  }
}
export async function updateProfile(updates) {
  try {
    const response = await api.patch("/profile/update", updates);
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}
