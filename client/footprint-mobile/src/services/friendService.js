import api from "./api";

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

  return error.message || "Something went wrong.";
}

export async function searchUsers(username) {
  try {
    const response = await api.get(
      `/friends/search?username=${encodeURIComponent(username)}`,
    );
    return response.data.users;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function sendFriendRequest(receiverId) {
  try {
    const response = await api.post("/friends/request", {
      receiver_id: receiverId,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function getFriendRequests() {
  try {
    const response = await api.get("/friends/requests");
    return response.data.requests;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function acceptFriendRequest(requestId) {
  try {
    const response = await api.patch(`/friends/requests/${requestId}/accept`);
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function declineFriendRequest(requestId) {
  try {
    const response = await api.patch(`/friends/requests/${requestId}/decline`);
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function getFriends() {
  try {
    const response = await api.get("/friends");
    return response.data.friends;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function removeFriend(friendId) {
  try {
    const response = await api.delete(`/friends/${friendId}`);
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function getFriendProfile(friendId) {
  try {
    const response = await api.get(`/friends/${friendId}/profile`);
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function compareWithFriend(friendId) {
  try {
    const response = await api.get(`/friends/${friendId}/compare`);
    return response.data.comparison;
  } catch (error) {
    throw new Error(extractError(error));
  }
}
