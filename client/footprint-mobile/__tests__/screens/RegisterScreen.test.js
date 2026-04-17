import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import RegisterScreen from "../../src/screens/RegisterScreen";
import { registerUser } from "../../src/services/authService";

jest.mock("../../src/services/authService", () => ({
  registerUser: jest.fn(),
}));

describe("RegisterScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders registration form fields and button", () => {
    const { getByText, getByPlaceholderText } = render(<RegisterScreen />);

    expect(getByText("Start your journey")).toBeTruthy();
    expect(getByPlaceholderText("maya_reyes")).toBeTruthy();
    expect(getByPlaceholderText("maya@example.com")).toBeTruthy();
    expect(getByPlaceholderText("At least 6 characters")).toBeTruthy();
    expect(getByPlaceholderText("United Kingdom")).toBeTruthy();
    expect(getByText("Create Account")).toBeTruthy();
  });

  it("shows validation errors when fields are empty", async () => {
    const { getByText, findByText } = render(<RegisterScreen />);

    fireEvent.press(getByText("Create Account"));

    expect(await findByText("Username is required.")).toBeTruthy();
    expect(await findByText("Email is required.")).toBeTruthy();
    expect(await findByText("Password is required.")).toBeTruthy();
    expect(await findByText("Home country is required.")).toBeTruthy();
  });

  it("shows validation error for invalid email", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText("maya_reyes"), "maya");
    fireEvent.changeText(getByPlaceholderText("maya@example.com"), "bad-email");
    fireEvent.changeText(getByPlaceholderText("At least 6 characters"), "123456");
    fireEvent.changeText(getByPlaceholderText("United Kingdom"), "Spain");
    fireEvent.press(getByText("Create Account"));

    expect(await findByText("Enter a valid email address.")).toBeTruthy();
  });

  it("shows validation error for short password", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText("maya_reyes"), "maya");
    fireEvent.changeText(getByPlaceholderText("maya@example.com"), "maya@test.com");
    fireEvent.changeText(getByPlaceholderText("At least 6 characters"), "123");
    fireEvent.changeText(getByPlaceholderText("United Kingdom"), "Spain");
    fireEvent.press(getByText("Create Account"));

    expect(await findByText("Password must be at least 6 characters.")).toBeTruthy();
  });

  it("calls registerUser with correct payload", async () => {
    registerUser.mockResolvedValue({
      id: 1,
      username: "maya",
      email: "maya@test.com",
      home_country: "Spain",
    });

    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText("maya_reyes"), "maya");
    fireEvent.changeText(getByPlaceholderText("maya@example.com"), "maya@test.com");
    fireEvent.changeText(getByPlaceholderText("At least 6 characters"), "123456");
    fireEvent.changeText(getByPlaceholderText("United Kingdom"), "Spain");
    fireEvent.press(getByText("Create Account"));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        id: null,
        username: "maya",
        email: "maya@test.com",
        password: "123456",
        home_country: "Spain",
      });
    });
  });

  it("shows success message on successful registration", async () => {
    registerUser.mockResolvedValue({
      id: 1,
      username: "maya",
      email: "maya@test.com",
      home_country: "Spain",
    });

    const { getByPlaceholderText, getByText, findByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText("maya_reyes"), "maya");
    fireEvent.changeText(getByPlaceholderText("maya@example.com"), "maya@test.com");
    fireEvent.changeText(getByPlaceholderText("At least 6 characters"), "123456");
    fireEvent.changeText(getByPlaceholderText("United Kingdom"), "Spain");
    fireEvent.press(getByText("Create Account"));

    expect(await findByText("Account created successfully.")).toBeTruthy();
  });

  it("shows server error when registration fails", async () => {
    registerUser.mockRejectedValue(new Error("Email already in use"));

    const { getByPlaceholderText, getByText, findByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText("maya_reyes"), "maya");
    fireEvent.changeText(getByPlaceholderText("maya@example.com"), "maya@test.com");
    fireEvent.changeText(getByPlaceholderText("At least 6 characters"), "123456");
    fireEvent.changeText(getByPlaceholderText("United Kingdom"), "Spain");
    fireEvent.press(getByText("Create Account"));

    expect(await findByText("Email already in use")).toBeTruthy();
  });
});