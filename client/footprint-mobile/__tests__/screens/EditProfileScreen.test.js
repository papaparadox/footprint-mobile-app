import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EditProfileScreen from "../../src/screens/EditProfileScreen";
import { router } from "expo-router";

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

describe("EditProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders edit profile screen fields", () => {
    const { getByText, getByPlaceholderText } = render(<EditProfileScreen />);

    expect(getByText("Edit your details")).toBeTruthy();
    expect(
      getByText("Update your profile information and password."),
    ).toBeTruthy();

    expect(getByPlaceholderText("maya_reyes")).toBeTruthy();
    expect(getByPlaceholderText("maya@example.com")).toBeTruthy();
    expect(getByPlaceholderText("Spain")).toBeTruthy();
    expect(getByPlaceholderText("Enter current password")).toBeTruthy();
    expect(getByPlaceholderText("Enter new password")).toBeTruthy();
    expect(getByPlaceholderText("Confirm new password")).toBeTruthy();

    expect(getByText("Save Changes")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
  });

  it("shows validation errors for empty required profile fields", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <EditProfileScreen />,
    );

    fireEvent.changeText(getByPlaceholderText("maya_reyes"), "");
    fireEvent.changeText(getByPlaceholderText("maya@example.com"), "");
    fireEvent.changeText(getByPlaceholderText("Spain"), "");

    fireEvent.press(getByText("Save Changes"));

    expect(await findByText("Username is required.")).toBeTruthy();
    expect(await findByText("Email is required.")).toBeTruthy();
    expect(await findByText("Home country is required.")).toBeTruthy();
  });

  it("shows validation error for invalid email", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <EditProfileScreen />,
    );

    fireEvent.changeText(getByPlaceholderText("maya@example.com"), "bad-email");
    fireEvent.press(getByText("Save Changes"));

    expect(await findByText("Enter a valid email address.")).toBeTruthy();
  });

  it("shows password validation errors when trying to change password without all fields", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <EditProfileScreen />,
    );

    fireEvent.changeText(getByPlaceholderText("Enter new password"), "123456");

    fireEvent.press(getByText("Save Changes"));

    expect(await findByText("Current password is required.")).toBeTruthy();
    expect(await findByText("Please confirm your new password.")).toBeTruthy();
  });

  it("shows error when new password is too short", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <EditProfileScreen />,
    );

    fireEvent.changeText(
      getByPlaceholderText("Enter current password"),
      "oldpass123",
    );
    fireEvent.changeText(getByPlaceholderText("Enter new password"), "123");
    fireEvent.changeText(getByPlaceholderText("Confirm new password"), "123");

    fireEvent.press(getByText("Save Changes"));

    expect(
      await findByText("New password must be at least 6 characters."),
    ).toBeTruthy();
  });

  it("shows error when passwords do not match", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <EditProfileScreen />,
    );

    fireEvent.changeText(
      getByPlaceholderText("Enter current password"),
      "oldpass123",
    );
    fireEvent.changeText(
      getByPlaceholderText("Enter new password"),
      "newpass123",
    );
    fireEvent.changeText(
      getByPlaceholderText("Confirm new password"),
      "different123",
    );

    fireEvent.press(getByText("Save Changes"));

    expect(await findByText("Passwords do not match.")).toBeTruthy();
  });

  it("shows success message when form is valid without password change", async () => {
    const { getByText, findByText } = render(<EditProfileScreen />);

    fireEvent.press(getByText("Save Changes"));

    expect(await findByText("Profile updated successfully.")).toBeTruthy();
  });

  it("shows success message when password change fields are valid", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <EditProfileScreen />,
    );

    fireEvent.changeText(
      getByPlaceholderText("Enter current password"),
      "oldpass123",
    );
    fireEvent.changeText(
      getByPlaceholderText("Enter new password"),
      "newpass123",
    );
    fireEvent.changeText(
      getByPlaceholderText("Confirm new password"),
      "newpass123",
    );

    fireEvent.press(getByText("Save Changes"));

    expect(await findByText("Profile updated successfully.")).toBeTruthy();
  });

  it("navigates back when cancel is pressed", () => {
    const { getByText } = render(<EditProfileScreen />);

    fireEvent.press(getByText("Cancel"));

    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it("renders change photo button", () => {
    const { getByText } = render(<EditProfileScreen />);

    expect(getByText("Change Photo")).toBeTruthy();
  });
});
