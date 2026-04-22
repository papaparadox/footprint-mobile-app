import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import TripDetailPage from "../../src/app/trip/[id]";
import {
  getTripById,
  updateTrip,
  addTripImage,
} from "../../src/services/tripService";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  Link: ({ children }) => children,
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
}));

jest.mock("../../src/services/tripService", () => ({
  getTripById: jest.fn(),
  updateTrip: jest.fn(),
  addTripImage: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const MOCK_TRIP = {
  id: 42,
  user_id: 1,
  title: "Japan",
  start_date: "2025-03-01",
  end_date: "2025-03-14",
  notes: "Incredible food and cherry blossoms.",
  mood: "5",
  visits: [
    {
      id: 1,
      country_name: "Japan",
      continent: "Asia",
      iso_code: "JP",
      flag_url: "https://flagcdn.com/jp.svg",
      city_name: "Tokyo",
    },
  ],
  images: [],
};

describe("TripDetailPage", () => {
  let mockPush;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });
    useLocalSearchParams.mockReturnValue({ id: "42" });
    getTripById.mockResolvedValue(MOCK_TRIP);
  });

  describe("data loading", () => {
    it("fetches the trip using the id from URL params", async () => {
      render(<TripDetailPage />);
      await waitFor(() => {
        expect(getTripById).toHaveBeenCalledWith("42");
      });
    });

    it("shows the country name after loading", async () => {
      const { findByText } = render(<TripDetailPage />);
      expect(await findByText("Japan")).toBeTruthy();
    });

    it("shows the continent from the first visit", async () => {
      const { findByText } = render(<TripDetailPage />);
      expect(await findByText("Asia")).toBeTruthy();
    });

    it("falls back to trip title in hero when there are no visits", async () => {
      getTripById.mockResolvedValue({ ...MOCK_TRIP, visits: [] });
      const { findByText } = render(<TripDetailPage />);
      expect(await findByText("Japan")).toBeTruthy();
    });

    it("shows 'Trip not found.' when the fetch fails", async () => {
      getTripById.mockRejectedValue(new Error("Not found"));
      const { findByText } = render(<TripDetailPage />);
      expect(await findByText("Trip not found.")).toBeTruthy();
    });

    it("shows the loading spinner before data arrives", () => {
      getTripById.mockImplementation(() => new Promise(() => {}));
      const { queryByText } = render(<TripDetailPage />);
      expect(queryByText("Japan")).toBeNull();
      expect(queryByText("Trip not found.")).toBeNull();
    });

    it("re-fetches when the trip id changes", async () => {
      const { rerender } = render(<TripDetailPage />);
      await waitFor(() => expect(getTripById).toHaveBeenCalledWith("42"));

      useLocalSearchParams.mockReturnValue({ id: "99" });
      getTripById.mockResolvedValue({
        ...MOCK_TRIP,
        id: 99,
        title: "Portugal",
      });
      rerender(<TripDetailPage />);

      await waitFor(() => expect(getTripById).toHaveBeenCalledWith("99"));
    });
  });

  describe("trip stats", () => {
    it("shows the correct number of days stayed", async () => {
      const { findByText } = render(<TripDetailPage />);
      expect(await findByText("13")).toBeTruthy();
    });

    it("shows the mood rating", async () => {
      const { findByText } = render(<TripDetailPage />);
      expect(await findByText("5")).toBeTruthy();
    });

    it("shows — for days when start_date is missing", async () => {
      getTripById.mockResolvedValue({ ...MOCK_TRIP, start_date: null });
      const { findAllByText } = render(<TripDetailPage />);
      const dashes = await findAllByText("—");
      expect(dashes.length).toBeGreaterThan(0);
    });

    it("shows — for mood when mood is null", async () => {
      getTripById.mockResolvedValue({ ...MOCK_TRIP, mood: null });
      const { findAllByText } = render(<TripDetailPage />);
      const dashes = await findAllByText("—");
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  describe("notes", () => {
    it("displays the existing trip notes", async () => {
      const { findByText } = render(<TripDetailPage />);
      expect(
        await findByText("Incredible food and cherry blossoms."),
      ).toBeTruthy();
    });

    it("shows 'No notes added yet.' when notes is null", async () => {
      getTripById.mockResolvedValue({ ...MOCK_TRIP, notes: null });
      const { findByText } = render(<TripDetailPage />);
      expect(await findByText("No notes added yet.")).toBeTruthy();
    });

    it("opens the notes modal when 'Add Notes' is pressed", async () => {
      const { findByText } = render(<TripDetailPage />);
      fireEvent.press(await findByText("Add Notes"));
      expect(await findByText("Your Notes")).toBeTruthy();
    });

    it("closes the notes modal when 'Cancel' is pressed", async () => {
      const { findByText, queryByText } = render(<TripDetailPage />);
      fireEvent.press(await findByText("Add Notes"));
      await findByText("Your Notes");
      fireEvent.press(await findByText("Cancel"));
      await waitFor(() => {
        expect(queryByText("Your Notes")).toBeNull();
      });
    });

    it("pre-fills the modal input with existing notes", async () => {
      const { findByText, getByPlaceholderText } = render(<TripDetailPage />);
      fireEvent.press(await findByText("Add Notes"));
      const input = getByPlaceholderText("Write about your trip...");
      expect(input.props.value).toBe("Incredible food and cherry blossoms.");
    });

    it("calls updateTrip with the new notes when Save is pressed", async () => {
      updateTrip.mockResolvedValue({ ...MOCK_TRIP, notes: "Updated notes" });
      const { findByText, getByPlaceholderText } = render(<TripDetailPage />);
      fireEvent.press(await findByText("Add Notes"));
      fireEvent.changeText(
        getByPlaceholderText("Write about your trip..."),
        "Updated notes",
      );
      fireEvent.press(await findByText("Save"));
      await waitFor(() => {
        expect(updateTrip).toHaveBeenCalledWith(42, { notes: "Updated notes" });
      });
    });

    it("updates the displayed notes after a successful save", async () => {
      updateTrip.mockResolvedValue({ ...MOCK_TRIP, notes: "Updated notes" });
      const { findByText, getByPlaceholderText } = render(<TripDetailPage />);
      fireEvent.press(await findByText("Add Notes"));
      fireEvent.changeText(
        getByPlaceholderText("Write about your trip..."),
        "Updated notes",
      );
      fireEvent.press(await findByText("Save"));
      expect(await findByText("Updated notes")).toBeTruthy();
    });

    it("still updates local notes if the API call fails", async () => {
      updateTrip.mockRejectedValue(new Error("Server error"));
      const { findByText, getByPlaceholderText } = render(<TripDetailPage />);
      fireEvent.press(await findByText("Add Notes"));
      fireEvent.changeText(
        getByPlaceholderText("Write about your trip..."),
        "Offline notes",
      );
      fireEvent.press(await findByText("Save"));
      expect(await findByText("Offline notes")).toBeTruthy();
    });
  });

  describe("photos section", () => {
    it("hides the Photos section when the images array is empty", async () => {
      const { findByText, queryByText } = render(<TripDetailPage />);
      await findByText("Add Notes");
      expect(queryByText("Photos")).toBeNull();
    });

    it("shows the Photos section when images exist", async () => {
      getTripById.mockResolvedValue({
        ...MOCK_TRIP,
        images: [
          {
            id: 1,
            trip_id: 42,
            image_url: "https://example.com/photo.jpg",
            caption: null,
            uploaded_at: "2025-03-05T10:00:00Z",
          },
        ],
      });
      const { findByText } = render(<TripDetailPage />);
      expect(await findByText("Photos")).toBeTruthy();
    });

    it("requests media library permission when Add Photo is pressed", async () => {
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
      });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: true });
      const { findByText } = render(<TripDetailPage />);
      fireEvent.press(await findByText("Add Photo"));
      await waitFor(() => {
        expect(
          ImagePicker.requestMediaLibraryPermissionsAsync,
        ).toHaveBeenCalled();
      });
    });

    it("does not open the picker when permission is denied", async () => {
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: false,
      });
      const { findByText } = render(<TripDetailPage />);
      fireEvent.press(await findByText("Add Photo"));
      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
      });
    });

    it("calls addTripImage with the trip id and selected asset", async () => {
      const mockAsset = {
        uri: "file://test.jpg",
        mimeType: "image/jpeg",
        fileName: "test.jpg",
      };
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
      });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [mockAsset],
      });
      addTripImage.mockResolvedValue({
        id: 99,
        trip_id: 42,
        image_url: "https://res.cloudinary.com/photo.jpg",
        caption: null,
        uploaded_at: new Date().toISOString(),
      });
      const { findByText } = render(<TripDetailPage />);
      fireEvent.press(await findByText("Add Photo"));
      await waitFor(() => {
        expect(addTripImage).toHaveBeenCalledWith(42, mockAsset);
      });
    });

    it("shows the Photos section after a successful upload", async () => {
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
      });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: "file://test.jpg",
            mimeType: "image/jpeg",
            fileName: "test.jpg",
          },
        ],
      });
      addTripImage.mockResolvedValue({
        id: 99,
        trip_id: 42,
        image_url: "https://res.cloudinary.com/photo.jpg",
        caption: null,
        uploaded_at: new Date().toISOString(),
      });
      const { findByText } = render(<TripDetailPage />);
      fireEvent.press(await findByText("Add Photo"));
      expect(await findByText("Photos")).toBeTruthy();
    });

    it("shows an alert when the photo upload fails", async () => {
      const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
      });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: "file://test.jpg",
            mimeType: "image/jpeg",
            fileName: "test.jpg",
          },
        ],
      });
      addTripImage.mockRejectedValue(new Error("Upload failed"));
      const { findByText } = render(<TripDetailPage />);
      fireEvent.press(await findByText("Add Photo"));
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          "Upload failed",
          "Could not upload the photo. Please try again.",
        );
      });
      alertSpy.mockRestore();
    });
  });

  describe("navigation", () => {
    it("navigates to /trips when the close button is pressed", async () => {
      const { findByText } = render(<TripDetailPage />);
      await findByText("Japan");
      fireEvent.press(await findByText("✕"));
      expect(mockPush).toHaveBeenCalledWith("/trips");
    });
  });
});
