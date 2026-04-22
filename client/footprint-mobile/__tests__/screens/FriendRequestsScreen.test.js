import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import FriendRequestsScreen from "../../src/screens/FriendRequestsScreen";
import {
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
} from "../../src/services/friendService";

jest.mock("../../src/services/friendService", () => ({
  getFriendRequests: jest.fn(),
  acceptFriendRequest: jest.fn(),
  declineFriendRequest: jest.fn(),
}));

describe("FriendRequestsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getFriendRequests.mockResolvedValue({
      incoming: [
        {
          id: 1,
          username: "alex",
          home_country: "Spain",
        },
      ],
      outgoing: [
        {
          id: 2,
          username: "maya",
          home_country: "Italy",
        },
      ],
    });

    acceptFriendRequest.mockResolvedValue({});
    declineFriendRequest.mockResolvedValue({});
  });

  it("renders incoming and outgoing requests", async () => {
    const { findByText } = render(<FriendRequestsScreen />);

    expect(await findByText("Friend Requests")).toBeTruthy();
    expect(await findByText("Incoming")).toBeTruthy();
    expect(await findByText("Outgoing")).toBeTruthy();
    expect(await findByText("alex")).toBeTruthy();
    expect(await findByText("maya")).toBeTruthy();
  });

  it("accepts an incoming request", async () => {
    const { findByText } = render(<FriendRequestsScreen />);

    fireEvent.press(await findByText("Accept"));

    await waitFor(() => {
      expect(acceptFriendRequest).toHaveBeenCalledWith(1);
    });
  });

  it("declines an incoming request", async () => {
    const { findByText } = render(<FriendRequestsScreen />);

    fireEvent.press(await findByText("Decline"));

    await waitFor(() => {
      expect(declineFriendRequest).toHaveBeenCalledWith(1);
    });
  });

  it("shows empty state when no requests exist", async () => {
    getFriendRequests.mockResolvedValueOnce({
      incoming: [],
      outgoing: [],
    });

    const { findByText } = render(<FriendRequestsScreen />);

    expect(await findByText("No incoming requests.")).toBeTruthy();
    expect(await findByText("No outgoing requests.")).toBeTruthy();
  });

  it("shows error when requests fail to load", async () => {
    getFriendRequests.mockRejectedValueOnce(
      new Error("Failed to load requests"),
    );

    const { findByText } = render(<FriendRequestsScreen />);

    expect(await findByText("Failed to load requests")).toBeTruthy();
  });
});
