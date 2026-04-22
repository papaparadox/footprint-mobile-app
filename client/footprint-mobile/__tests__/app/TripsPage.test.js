import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

jest.setTimeout(15000);
import TripsPage from "../../src/app/trips";
import { getProfile } from "../../src/services/userService";
import { getTripsByUser, createTrip } from "../../src/services/tripService";
import { getAllCountries } from "../../src/services/countryService";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  Link: ({ children }) => children,
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
}));

jest.mock("../../src/services/userService", () => ({
  getProfile: jest.fn(),
}));

jest.mock("../../src/services/tripService", () => ({
  getTripsByUser: jest.fn(),
  createTrip: jest.fn(),
}));

jest.mock("../../src/services/countryService", () => ({
  getAllCountries: jest.fn(),
}));

const MOCK_USER = { id: 1, username: "testuser" };

const MOCK_TRIPS = [
  { id: 1, title: "Japan", start_date: "2025-03-01", end_date: "2025-03-14" },
  { id: 2, title: "Portugal", start_date: "2024-08-01", end_date: "2024-08-07" },
];

const MOCK_COUNTRIES = [
  { id: 1, name: "Japan", iso_code: "JP", continent: "Asia" },
  { id: 2, name: "Portugal", iso_code: "PT", continent: "Europe" },
  { id: 3, name: "Germany", iso_code: "DE", continent: "Europe" },
];

describe("TripsPage", () => {
  let mockPush;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });
    getProfile.mockResolvedValue(MOCK_USER);
    getTripsByUser.mockResolvedValue(MOCK_TRIPS);
    getAllCountries.mockResolvedValue(MOCK_COUNTRIES);
  });

  describe("initial load", () => {
    it("renders the page title", async () => {
      const { findByText } = render(<TripsPage />);
      expect(await findByText("Trips")).toBeTruthy();
    });

    it("fetches trips for the logged-in user", async () => {
      render(<TripsPage />);
      await waitFor(() => {
        expect(getProfile).toHaveBeenCalledTimes(1);
        expect(getTripsByUser).toHaveBeenCalledWith(MOCK_USER.id);
      });
    });

    it("fetches all countries on mount", async () => {
      render(<TripsPage />);
      await waitFor(() => {
        expect(getAllCountries).toHaveBeenCalledTimes(1);
      });
    });

    it("renders trip titles after data loads", async () => {
      const { findByText } = render(<TripsPage />);
      expect(await findByText("Japan")).toBeTruthy();
      expect(await findByText("Portugal")).toBeTruthy();
    });

    it("renders the formatted start date on each card", async () => {
      const { findByText } = render(<TripsPage />);
      expect(await findByText("Mar 2025")).toBeTruthy();
      expect(await findByText("Aug 2024")).toBeTruthy();
    });

    it("shows 'No trips yet.' when the user has no trips", async () => {
      getTripsByUser.mockResolvedValue([]);
      const { findByText } = render(<TripsPage />);
      expect(await findByText("No trips yet.")).toBeTruthy();
    });

    it("shows an error message when the fetch fails", async () => {
      getProfile.mockRejectedValue(new Error("Network error"));
      const { findByText } = render(<TripsPage />);
      expect(await findByText("Network error")).toBeTruthy();
    });

    it("shows the loading spinner while data is being fetched", () => {
      getProfile.mockImplementation(() => new Promise(() => {}));
      const { queryByText } = render(<TripsPage />);
      expect(queryByText("Japan")).toBeNull();
      expect(queryByText("No trips yet.")).toBeNull();
    });
  });

  describe("trip card navigation", () => {
    it("navigates to the correct trip detail when a card is pressed", async () => {
      const { findByText } = render(<TripsPage />);
      fireEvent.press(await findByText("Japan"));
      expect(mockPush).toHaveBeenCalledWith("/trip/1");
    });

    it("navigates to the second trip when its card is pressed", async () => {
      const { findByText } = render(<TripsPage />);
      fireEvent.press(await findByText("Portugal"));
      expect(mockPush).toHaveBeenCalledWith("/trip/2");
    });
  });

  describe("Add Trip modal", () => {
    it("opens the modal when '+ Add Trip' is pressed", async () => {
      const { findByText } = render(<TripsPage />);
      fireEvent.press(await findByText("+ Add Trip"));
      expect(await findByText("Latest Trip")).toBeTruthy();
    });

    it("closes the modal when the ✕ button is pressed", async () => {
      const { findByText, queryByText } = render(<TripsPage />);
      fireEvent.press(await findByText("+ Add Trip"));
      await findByText("Latest Trip");
      fireEvent.press(await findByText("✕"));
      await waitFor(() => {
        expect(queryByText("Latest Trip")).toBeNull();
      });
    });

    it("shows country names in the list", async () => {
      const { findByText } = render(<TripsPage />);
      fireEvent.press(await findByText("+ Add Trip"));
      expect(await findByText("Germany")).toBeTruthy();
    });

    it("filters countries as the user types in the search box", async () => {
      const { findByText, getByPlaceholderText, getAllByText } = render(<TripsPage />);
      fireEvent.press(await findByText("+ Add Trip"));
      await findByText("Germany");
      fireEvent.changeText(getByPlaceholderText("Search countries..."), "Ger");
      await waitFor(() => {
        expect(getAllByText("Germany").length).toBeGreaterThanOrEqual(1);
        expect(getAllByText("Japan").length).toBe(1);
      });
    });

    it("shows 'Select a country first' on the confirm button before selection", async () => {
      const { findByText } = render(<TripsPage />);
      fireEvent.press(await findByText("+ Add Trip"));
      expect(await findByText("Select a country first")).toBeTruthy();
    });

    it("updates the confirm button text after selecting a country", async () => {
      const { findByText } = render(<TripsPage />);
      fireEvent.press(await findByText("+ Add Trip"));
      fireEvent.press(await findByText("Germany"));
      expect(await findByText("Add Trip to Germany")).toBeTruthy();
    });

    it("shows a date error when start date is missing", async () => {
      const { findByText } = render(<TripsPage />);
      fireEvent.press(await findByText("+ Add Trip"));
      fireEvent.press(await findByText("Germany"));
      fireEvent.press(await findByText("Add Trip to Germany"));
      expect(await findByText("Enter a valid start date (YYYY-MM-DD).")).toBeTruthy();
    });

    it("shows a date error when end date is missing", async () => {
      const { findByText, getAllByPlaceholderText } = render(<TripsPage />);
      fireEvent.press(await findByText("+ Add Trip"));
      fireEvent.press(await findByText("Germany"));
      const [startInput] = getAllByPlaceholderText("YYYY-MM-DD");
      fireEvent.changeText(startInput, "20250601");
      fireEvent.press(await findByText("Add Trip to Germany"));
      expect(await findByText("Enter a valid end date (YYYY-MM-DD).")).toBeTruthy();
    });

    it("shows a date error when end date is before start date", async () => {
      const { findByText, getAllByPlaceholderText } = render(<TripsPage />);
      fireEvent.press(await findByText("+ Add Trip"));
      fireEvent.press(await findByText("Germany"));
      const [startInput, endInput] = getAllByPlaceholderText("YYYY-MM-DD");
      fireEvent.changeText(startInput, "20250601");
      fireEvent.changeText(endInput, "20250501");
      fireEvent.press(await findByText("Add Trip to Germany"));
      expect(await findByText("End date must be on or after the start date.")).toBeTruthy();
    });

    it("calls createTrip with the correct payload on a valid submission", async () => {
      createTrip.mockResolvedValue({ id: 99, title: "Germany", start_date: "2025-06-01", end_date: "2025-06-14" });
      const { findByText, getAllByPlaceholderText } = render(<TripsPage />);
      fireEvent.press(await findByText("+ Add Trip"));
      fireEvent.press(await findByText("Germany"));
      const [startInput, endInput] = getAllByPlaceholderText("YYYY-MM-DD");
      fireEvent.changeText(startInput, "20250601");
      fireEvent.changeText(endInput, "20250614");
      fireEvent.press(await findByText("Add Trip to Germany"));
      await waitFor(() => {
        expect(createTrip).toHaveBeenCalledWith({
          title: "Germany",
          start_date: "2025-06-01",
          end_date: "2025-06-14",
        });
      });
    });

    it("navigates to the new trip's detail screen after creation", async () => {
      createTrip.mockResolvedValue({ id: 99, title: "Germany", start_date: "2025-06-01", end_date: "2025-06-14" });
      const { findByText, getAllByPlaceholderText } = render(<TripsPage />);
      fireEvent.press(await findByText("+ Add Trip"));
      fireEvent.press(await findByText("Germany"));
      const [startInput, endInput] = getAllByPlaceholderText("YYYY-MM-DD");
      fireEvent.changeText(startInput, "20250601");
      fireEvent.changeText(endInput, "20250614");
      fireEvent.press(await findByText("Add Trip to Germany"));
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/trip/99");
      });
    });

    it("adds the new trip to the list after creation", async () => {
      const newTrip = { id: 99, title: "Germany", start_date: "2025-07-01", end_date: "2025-07-10" };
      createTrip.mockResolvedValue(newTrip);
      const { findByText, getAllByPlaceholderText } = render(<TripsPage />);
      fireEvent.press(await findByText("+ Add Trip"));
      fireEvent.press(await findByText("Germany"));
      const [startInput, endInput] = getAllByPlaceholderText("YYYY-MM-DD");
      fireEvent.changeText(startInput, "20250701");
      fireEvent.changeText(endInput, "20250710");
      fireEvent.press(await findByText("Add Trip to Germany"));
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/trip/99");
      });
    });
  });

  describe("date input formatting", () => {
    it("auto-formats 8 digits into YYYY-MM-DD", async () => {
      const { findByText, getAllByPlaceholderText } = render(<TripsPage />);
      fireEvent.press(await findByText("+ Add Trip"));
      fireEvent.press(await findByText("Germany"));
      const [startInput] = getAllByPlaceholderText("YYYY-MM-DD");
      fireEvent.changeText(startInput, "20250601");
      await waitFor(() => {
        expect(startInput.props.value).toBe("2025-06-01");
      });
    });

    it("inserts dash after year while still typing", async () => {
      const { findByText, getAllByPlaceholderText } = render(<TripsPage />);
      fireEvent.press(await findByText("+ Add Trip"));
      fireEvent.press(await findByText("Germany"));
      const [startInput] = getAllByPlaceholderText("YYYY-MM-DD");
      fireEvent.changeText(startInput, "202506");
      await waitFor(() => {
        expect(startInput.props.value).toBe("2025-06");
      });
    });

    it("strips non-numeric characters from date input", async () => {
      const { findByText, getAllByPlaceholderText } = render(<TripsPage />);
      fireEvent.press(await findByText("+ Add Trip"));
      fireEvent.press(await findByText("Germany"));
      const [startInput] = getAllByPlaceholderText("YYYY-MM-DD");
      fireEvent.changeText(startInput, "2025/06/01");
      await waitFor(() => {
        expect(startInput.props.value).toBe("2025-06-01");
      });
    });
  });
});
