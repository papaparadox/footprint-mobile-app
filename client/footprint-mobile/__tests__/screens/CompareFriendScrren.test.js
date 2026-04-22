import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CompareFriendScreen from "../../src/screens/CompareFriendScreen";
import { compareWithFriend } from "../../src/services/friendService";

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({
    friendId: "1",
  }),
}));

jest.mock("../../src/services/friendService", () => ({
  compareWithFriend: jest.fn(),
}));

jest.mock("../../src/components/GlobeView", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function MockGlobeView() {
    return <Text>Mock Globe View</Text>;
  };
});

describe("CompareFriendScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    compareWithFriend.mockResolvedValue({
      my_stats: {
        countries_visited: 5,
        continents_visited: 2,
        world_coverage_percent: 3,
      },
      friend_stats: {
        countries_visited: 7,
        continents_visited: 3,
        world_coverage_percent: 4,
      },
      overlap: {
        common_countries: [{ id: 1, name: "Brazil" }],
        only_mine: [{ id: 2, name: "China" }],
        only_theirs: [{ id: 3, name: "Spain" }],
      },
    });
  });

  it("renders compare screen data", async () => {
    const { findByText } = render(<CompareFriendScreen />);

    expect(await findByText("Journey Matchup")).toBeTruthy();
    expect(await findByText("Mock Globe View")).toBeTruthy();
    expect(await findByText("Common Countries")).toBeTruthy();
    expect(await findByText("Only You")).toBeTruthy();
    expect(await findByText("Only Friend")).toBeTruthy();
    expect(await findByText("Brazil")).toBeTruthy();
    expect(await findByText("China")).toBeTruthy();
    expect(await findByText("Spain")).toBeTruthy();
  });

  it("switches compare globe tabs", async () => {
    const { findAllByText, findByText } = render(<CompareFriendScreen />);

    const friendMatches = await findAllByText("Friend");
    const commonMatches = await findAllByText("Common");
    const mineMatches = await findAllByText("Mine");

    fireEvent.press(friendMatches[1]);
    fireEvent.press(commonMatches[0]);
    fireEvent.press(mineMatches[0]);

    expect(await findByText("Mock Globe View")).toBeTruthy();
  });

  it("shows empty text when no overlap data exists", async () => {
    compareWithFriend.mockResolvedValueOnce({
      my_stats: {
        countries_visited: 0,
        continents_visited: 0,
        world_coverage_percent: 0,
      },
      friend_stats: {
        countries_visited: 0,
        continents_visited: 0,
        world_coverage_percent: 0,
      },
      overlap: {
        common_countries: [],
        only_mine: [],
        only_theirs: [],
      },
    });

    const { findAllByText } = render(<CompareFriendScreen />);

    const emptyTexts = await findAllByText(/No .* yet\./);
    expect(emptyTexts.length).toBeGreaterThan(0);
  });

  it("shows error when compare fails to load", async () => {
    compareWithFriend.mockRejectedValueOnce(new Error("Compare failed"));

    const { findByText } = render(<CompareFriendScreen />);

    expect(await findByText("Compare failed")).toBeTruthy();
  });
});
