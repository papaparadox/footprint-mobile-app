import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../../src/screens/LoginScreen";
import { loginUser } from "../../src/services/authService";
import { router } from "expo-router";

jest.mock("../../src/services/authService", () => ({
  loginUser: jest.fn(),
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form fields and button", () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    expect(getByText("Welcome back")).toBeTruthy();
    expect(getByPlaceholderText("maya@example.com")).toBeTruthy();
    expect(getByPlaceholderText("Enter password")).toBeTruthy();
    expect(getByText("Log In")).toBeTruthy();
  });

  it("shows validation errors when fields are empty", async () => {
    const { getByText, findByText } = render(<LoginScreen />);

    fireEvent.press(getByText("Log In"));

    expect(await findByText("Email is required.")).toBeTruthy();
    expect(await findByText("Password is required.")).toBeTruthy();
  });

  it("shows validation error for invalid email", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("maya@example.com"), "bad-email");
    fireEvent.changeText(getByPlaceholderText("Enter password"), "123456");
    fireEvent.press(getByText("Log In"));

    expect(await findByText("Enter a valid email address.")).toBeTruthy();
  });

  it("shows validation error for short password", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("maya@example.com"), "maya@test.com");
    fireEvent.changeText(getByPlaceholderText("Enter password"), "123");
    fireEvent.press(getByText("Log In"));

    expect(await findByText("Password must be at least 6 characters.")).toBeTruthy();
  });

  it("calls loginUser with correct values", async () => {
    loginUser.mockResolvedValue({ token: "mock-token" });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("maya@example.com"), "maya@test.com");
    fireEvent.changeText(getByPlaceholderText("Enter password"), "123456");
    fireEvent.press(getByText("Log In"));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("maya@test.com", "123456");
    });
  });

  it("redirects to home after successful login", async () => {
    loginUser.mockResolvedValue({ token: "mock-token" });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("maya@example.com"), "maya@test.com");
    fireEvent.changeText(getByPlaceholderText("Enter password"), "123456");
    fireEvent.press(getByText("Log In"));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/home");
    });
  });

  it("shows server error when login fails", async () => {
    loginUser.mockRejectedValue(new Error("Invalid email or password"));

    const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("maya@example.com"), "maya@test.com");
    fireEvent.changeText(getByPlaceholderText("Enter password"), "123456");
    fireEvent.press(getByText("Log In"));

    expect(await findByText("Invalid email or password")).toBeTruthy();
  });
});