import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import FriendProfileScreen from "../../src/screens/FriendProfileScreen";
import { getFriendProfile } from "../../src/services/friendService";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({
    friendId: "1",
  }),
}));

jest.mock("../../src/services/friendService", () => ({
  getFriendProfile: jest.fn(),
}));

jest.mock("../../src/components/GlobeView", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function MockGlobeView() {
    return <Text>Mock Globe View</Text>;
  };
});

describe("FriendProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getFriendProfile.mockResolvedValue({
      user: {
        id: 1,
        username: "alex",
        home_country: "Spain",
      },
      stats: {
        countries_visited: 5,
        continents_visited: 2,
      },
      visited_countries: [{ name: "Brazil" }, { name: "China" }],
      continent_breakdown: [{ continent: "Europe", countries_count: 2 }],
      most_recent_visit: {
        country_name: "Brazil",
        iso_code: "BR",
      },
    });
  });

  it("renders friend profile data", async () => {
    const { findByText } = render(<FriendProfileScreen />);

    expect(await findByText("alex")).toBeTruthy();
    expect(await findByText("Spain")).toBeTruthy();
    expect(await findByText("Mock Globe View")).toBeTruthy();
    expect(await findByText("Continent Breakdown")).toBeTruthy();
    expect(await findByText("Most Recent Visit")).toBeTruthy();
    expect(await findByText("Compare Journeys")).toBeTruthy();
  });

  it("navigates to compare screen", async () => {
    const { findByText } = render(<FriendProfileScreen />);

    fireEvent.press(await findByText("Compare Journeys"));

    expect(mockPush).toHaveBeenCalledWith("/friends/1/compare");
  });

  it("shows empty breakdown text when no continent data exists", async () => {
    getFriendProfile.mockResolvedValueOnce({
      user: {
        id: 1,
        username: "alex",
        home_country: "Spain",
      },
      stats: {
        countries_visited: 0,
        continents_visited: 0,
      },
      visited_countries: [],
      continent_breakdown: [],
      most_recent_visit: null,
    });

    const { findByText } = render(<FriendProfileScreen />);

    expect(await findByText("No continent data yet.")).toBeTruthy();
    expect(await findByText("No recent visit yet.")).toBeTruthy();
  });

  it("shows error when friend profile fails to load", async () => {
    getFriendProfile.mockRejectedValueOnce(new Error("Failed to load profile"));

    const { findByText } = render(<FriendProfileScreen />);

    expect(await findByText("Failed to load profile")).toBeTruthy();
  });
});
