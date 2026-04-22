import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import CountriesPage from "../../src/app/countries";
import { getToken } from "../../src/services/tokenService";


const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("../../src/services/tokenService", () => ({
  getToken: jest.fn(),
}));

// mock of GlobeView
jest.mock("../../src/components/GlobeView", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");

  return ({ onMessage }) => (
    <>
      <Pressable
        onPress={() =>
          onMessage({
            nativeEvent: {
              data: JSON.stringify({
                type: "country-click",
                name: "France",
              }),
            },
          })
        }
      >
        <Text>Click France</Text>
      </Pressable>
    </>
  );
});

global.fetch = jest.fn();

describe("CountriesPage (simple tests)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert = jest.fn();
  });

  // Renders page
  it("renders correctly", async () => {
    getToken.mockResolvedValue("token");
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { getByText } = render(<CountriesPage />);

    expect(getByText("Explore the World")).toBeTruthy();

    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });

  // Fetches countries
  it("fetches countries on load", async () => {
    getToken.mockResolvedValue("token");
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: "France" }],
    });

    render(<CountriesPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  // Adds country when clicked
  it("adds a country when clicked", async () => {
    getToken.mockResolvedValue("token");
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: "France" }],
    });

    const { getByText } = render(<CountriesPage />);

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    fireEvent.press(getByText("Click France"));

    expect(getByText("France")).toBeTruthy();
  });

  // Removes country when clicked again
  it("removes country when clicked twice", async () => {
    getToken.mockResolvedValue("token");
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: "France" }],
    });

    const { getByText, queryByText } = render(<CountriesPage />);

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    fireEvent.press(getByText("Click France"));
    expect(getByText("France")).toBeTruthy();

    fireEvent.press(getByText("Click France"));
    expect(queryByText("France")).toBeNull();
  });

  // Saves successfully
  it("saves and navigates", async () => {
    getToken
      .mockResolvedValueOnce("token") // load
      .mockResolvedValueOnce("token"); // save

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, name: "France" }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    const { getByText } = render(<CountriesPage />);

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    fireEvent.press(getByText("Click France"));
    fireEvent.press(getByText("Save to Travel Log"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Countries saved!",
        expect.anything()
      );
    });
  });
});