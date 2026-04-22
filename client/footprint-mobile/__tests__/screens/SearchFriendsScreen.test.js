import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SearchFriendsScreen from "../../src/screens/SearchFriendsScreen";
import {
  searchUsers,
  sendFriendRequest,
} from "../../src/services/friendService";

jest.mock("../../src/services/friendService", () => ({
  searchUsers: jest.fn(),
  sendFriendRequest: jest.fn(),
}));

describe("SearchFriendsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    searchUsers.mockResolvedValue([
      {
        id: 1,
        username: "alex",
        home_country: "Spain",
      },
    ]);

    sendFriendRequest.mockResolvedValue({});
  });

  it("renders search screen", () => {
    const { getByText, getByPlaceholderText } = render(<SearchFriendsScreen />);

    expect(getByText("Find Friends")).toBeTruthy();
    expect(getByPlaceholderText("maya")).toBeTruthy();
    expect(getByText("Search Friends")).toBeTruthy();
  });

  it("shows validation error when search query is empty", async () => {
    const { getByText, findByText } = render(<SearchFriendsScreen />);

    fireEvent.press(getByText("Search Friends"));

    expect(await findByText("Please enter a username.")).toBeTruthy();
  });

  it("searches users and renders results", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <SearchFriendsScreen />,
    );

    fireEvent.changeText(getByPlaceholderText("maya"), "alex");
    fireEvent.press(getByText("Search Friends"));

    await waitFor(() => {
      expect(searchUsers).toHaveBeenCalledWith("alex");
    });

    expect(await findByText("alex")).toBeTruthy();
  });

  it("sends a friend request", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <SearchFriendsScreen />,
    );

    fireEvent.changeText(getByPlaceholderText("maya"), "alex");
    fireEvent.press(getByText("Search Friends"));

    expect(await findByText("alex")).toBeTruthy();

    fireEvent.press(await findByText("Send Friend Request"));

    await waitFor(() => {
      expect(sendFriendRequest).toHaveBeenCalledWith(1);
    });
  });

  it("shows success message when request is sent", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <SearchFriendsScreen />,
    );

    fireEvent.changeText(getByPlaceholderText("maya"), "alex");
    fireEvent.press(getByText("Search Friends"));

    fireEvent.press(await findByText("Send Friend Request"));

    expect(await findByText("Friend request sent successfully.")).toBeTruthy();
  });

  it("shows server error when search fails", async () => {
    searchUsers.mockRejectedValueOnce(new Error("Search failed"));

    const { getByPlaceholderText, getByText, findByText } = render(
      <SearchFriendsScreen />,
    );

    fireEvent.changeText(getByPlaceholderText("maya"), "alex");
    fireEvent.press(getByText("Search Friends"));

    expect(await findByText("Search failed")).toBeTruthy();
  });
});
