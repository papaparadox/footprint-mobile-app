import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import EditProfileScreen from "../../src/screens/EditProfileScreen";
import { router } from "expo-router";
import { getProfile, updateProfile } from "../../src/services/userService";

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock("../../src/services/userService", () => ({
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
}));

describe("EditProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getProfile.mockResolvedValue({
      username: "maya_reyes",
      email: "maya@example.com",
      home_country: "Spain",
    });

    updateProfile.mockResolvedValue({});
  });

  it("renders loaded profile fields", async () => {
    const { getByText, getByDisplayValue, getByPlaceholderText } = render(
      <EditProfileScreen />,
    );

    await waitFor(() => {
      expect(getByText("Edit your details")).toBeTruthy();
    });

    expect(
      getByText("Update your essentials and keep your profile current."),
    ).toBeTruthy();

    expect(getByDisplayValue("maya_reyes")).toBeTruthy();
    expect(getByDisplayValue("maya@example.com")).toBeTruthy();
    expect(getByDisplayValue("Spain")).toBeTruthy();

    expect(getByPlaceholderText("Current password")).toBeTruthy();
    expect(getByPlaceholderText("New password")).toBeTruthy();
    expect(getByPlaceholderText("Confirm password")).toBeTruthy();

    expect(getByText("Save Changes")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByText("← Back")).toBeTruthy();
    expect(getByText("Profile Photo")).toBeTruthy();
  });

  it("shows validation errors for empty required profile fields", async () => {
    const { getByDisplayValue, getByText, findByText } = render(
      <EditProfileScreen />,
    );

    await waitFor(() => {
      expect(getByDisplayValue("maya_reyes")).toBeTruthy();
    });

    fireEvent.changeText(getByDisplayValue("maya_reyes"), "");
    fireEvent.changeText(getByDisplayValue("maya@example.com"), "");
    fireEvent.changeText(getByDisplayValue("Spain"), "");

    fireEvent.press(getByText("Save Changes"));

    expect(await findByText("Username is required.")).toBeTruthy();
    expect(await findByText("Email is required.")).toBeTruthy();
    expect(await findByText("Home country is required.")).toBeTruthy();
  });

  it("shows validation error for invalid email", async () => {
    const { getByDisplayValue, getByText, findByText } = render(
      <EditProfileScreen />,
    );

    await waitFor(() => {
      expect(getByDisplayValue("maya@example.com")).toBeTruthy();
    });

    fireEvent.changeText(getByDisplayValue("maya@example.com"), "bad-email");
    fireEvent.press(getByText("Save Changes"));

    expect(await findByText("Enter a valid email address.")).toBeTruthy();
  });

  it("shows password validation errors when trying to change password without all fields", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <EditProfileScreen />,
    );

    await waitFor(() => {
      expect(getByText("Save Changes")).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText("New password"), "123456");
    fireEvent.press(getByText("Save Changes"));

    expect(await findByText("Current password is required.")).toBeTruthy();
    expect(await findByText("Please confirm your new password.")).toBeTruthy();
  });

  it("shows error when new password is too short", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <EditProfileScreen />,
    );

    await waitFor(() => {
      expect(getByText("Save Changes")).toBeTruthy();
    });

    fireEvent.changeText(
      getByPlaceholderText("Current password"),
      "oldpass123",
    );
    fireEvent.changeText(getByPlaceholderText("New password"), "123");
    fireEvent.changeText(getByPlaceholderText("Confirm password"), "123");

    fireEvent.press(getByText("Save Changes"));

    expect(
      await findByText("New password must be at least 6 characters."),
    ).toBeTruthy();
  });

  it("shows error when passwords do not match", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <EditProfileScreen />,
    );

    await waitFor(() => {
      expect(getByText("Save Changes")).toBeTruthy();
    });

    fireEvent.changeText(
      getByPlaceholderText("Current password"),
      "oldpass123",
    );
    fireEvent.changeText(getByPlaceholderText("New password"), "newpass123");
    fireEvent.changeText(
      getByPlaceholderText("Confirm password"),
      "different123",
    );

    fireEvent.press(getByText("Save Changes"));

    expect(await findByText("Passwords do not match.")).toBeTruthy();
  });

  it("shows error when no changes are made", async () => {
    const { getByText, findByText } = render(<EditProfileScreen />);

    await waitFor(() => {
      expect(getByText("Save Changes")).toBeTruthy();
    });

    fireEvent.press(getByText("Save Changes"));

    expect(await findByText("No changes to save.")).toBeTruthy();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it("shows success message and calls updateProfile when profile fields change", async () => {
    const { getByDisplayValue, getByText, findByText } = render(
      <EditProfileScreen />,
    );

    await waitFor(() => {
      expect(getByDisplayValue("maya_reyes")).toBeTruthy();
    });

    fireEvent.changeText(getByDisplayValue("maya_reyes"), "new_maya");
    fireEvent.press(getByText("Save Changes"));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({
        username: "new_maya",
      });
    });

    expect(await findByText("Profile updated successfully.")).toBeTruthy();
  });

  it("shows success message and calls updateProfile when password fields are valid", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <EditProfileScreen />,
    );

    await waitFor(() => {
      expect(getByText("Save Changes")).toBeTruthy();
    });

    fireEvent.changeText(
      getByPlaceholderText("Current password"),
      "oldpass123",
    );
    fireEvent.changeText(getByPlaceholderText("New password"), "newpass123");
    fireEvent.changeText(
      getByPlaceholderText("Confirm password"),
      "newpass123",
    );

    fireEvent.press(getByText("Save Changes"));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({
        password: "newpass123",
      });
    });

    expect(await findByText("Profile updated successfully.")).toBeTruthy();
  });

  it("navigates to profile when cancel is pressed", async () => {
    const { getByText } = render(<EditProfileScreen />);

    await waitFor(() => {
      expect(getByText("Cancel")).toBeTruthy();
    });

    fireEvent.press(getByText("Cancel"));

    expect(router.replace).toHaveBeenCalledWith("/profile");
  });

  it("navigates to profile when back is pressed", async () => {
    const { getByText } = render(<EditProfileScreen />);

    await waitFor(() => {
      expect(getByText("← Back")).toBeTruthy();
    });

    fireEvent.press(getByText("← Back"));

    expect(router.replace).toHaveBeenCalledWith("/profile");
  });

  it("shows server error when getProfile fails", async () => {
    getProfile.mockRejectedValueOnce(new Error("Failed to load profile"));

    const { findByText } = render(<EditProfileScreen />);

    expect(await findByText("Failed to load profile")).toBeTruthy();
  });

  it("shows server error when updateProfile fails", async () => {
    updateProfile.mockRejectedValueOnce(new Error("Update failed"));

    const { getByDisplayValue, getByText, findByText } = render(
      <EditProfileScreen />,
    );

    await waitFor(() => {
      expect(getByDisplayValue("maya_reyes")).toBeTruthy();
    });

    fireEvent.changeText(getByDisplayValue("maya_reyes"), "updated_name");
    fireEvent.press(getByText("Save Changes"));

    expect(await findByText("Update failed")).toBeTruthy();
  });
});
