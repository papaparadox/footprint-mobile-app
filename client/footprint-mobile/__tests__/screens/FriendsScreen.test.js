import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import FriendsScreen from "../../src/screens/FriendsScreen";
import {
  getFriends,
  getFriendRequests,
  removeFriend,
} from "../../src/services/friendService";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock("../../src/services/friendService", () => ({
  getFriends: jest.fn(),
  getFriendRequests: jest.fn(),
  removeFriend: jest.fn(),
}));

describe("FriendsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getFriends.mockResolvedValue([
      {
        id: 1,
        username: "alex",
        home_country: "Spain",
      },
      {
        id: 2,
        username: "maya",
        home_country: "Italy",
      },
    ]);

    getFriendRequests.mockResolvedValue({
      incoming: [{ id: 10 }],
      outgoing: [],
    });

    removeFriend.mockResolvedValue({});
  });

  it("renders friends list", async () => {
    const { findByText } = render(<FriendsScreen />);

    expect(await findByText("Your travel circle")).toBeTruthy();
    expect(await findByText("alex")).toBeTruthy();
    expect(await findByText("maya")).toBeTruthy();
    expect(await findByText("Requests")).toBeTruthy();
  });

  it("navigates to search screen", async () => {
    const { findByText } = render(<FriendsScreen />);

    fireEvent.press(await findByText("Find Friends"));

    expect(mockPush).toHaveBeenCalledWith("/friends/search");
  });

  it("navigates to requests screen", async () => {
    const { findByText } = render(<FriendsScreen />);

    fireEvent.press(await findByText("Requests"));

    expect(mockPush).toHaveBeenCalledWith("/friends/requests");
  });

  it("navigates to friend profile", async () => {
    const { findAllByText } = render(<FriendsScreen />);

    const viewButtons = await findAllByText("View");
    fireEvent.press(viewButtons[0]);

    expect(mockPush).toHaveBeenCalledWith("/friends/1/profile");
  });

  it("navigates to compare screen", async () => {
    const { findAllByText } = render(<FriendsScreen />);

    const compareButtons = await findAllByText("Compare");
    fireEvent.press(compareButtons[0]);

    expect(mockPush).toHaveBeenCalledWith("/friends/1/compare");
  });

  it("removes a friend", async () => {
    const { findAllByText } = render(<FriendsScreen />);

    const removeButtons = await findAllByText("Remove");
    fireEvent.press(removeButtons[0]);

    await waitFor(() => {
      expect(removeFriend).toHaveBeenCalledWith(1);
    });
  });

  it("shows empty state when no friends exist", async () => {
    getFriends.mockResolvedValueOnce([]);
    getFriendRequests.mockResolvedValueOnce({
      incoming: [],
      outgoing: [],
    });

    const { findByText } = render(<FriendsScreen />);

    expect(await findByText("No friends yet")).toBeTruthy();
    expect(
      await findByText("Start by searching for other travellers."),
    ).toBeTruthy();
  });

  it("shows server error when loading fails", async () => {
    getFriends.mockRejectedValueOnce(new Error("Failed to load friends"));

    const { findByText } = render(<FriendsScreen />);

    expect(await findByText("Failed to load friends")).toBeTruthy();
  });
});
