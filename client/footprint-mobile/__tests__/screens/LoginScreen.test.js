import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../../src/screens/LoginScreen";
import { loginUser } from "../../src/services/authService";

const mockReplace = jest.fn();
const mockSignIn = jest.fn();

jest.mock("expo-router", () => ({
  Link: ({ children }) => children,
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock("../../src/services/authService", () => ({
  loginUser: jest.fn(),
}));

jest.mock("../../src/context/AuthContext", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form fields and button", () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    expect(getByText("Welcome back")).toBeTruthy();
    expect(
      getByText("Log in to continue tracking your travel story."),
    ).toBeTruthy();

    expect(getByPlaceholderText("maya@example.com")).toBeTruthy();
    expect(getByPlaceholderText("Enter password")).toBeTruthy();
    expect(getByText("Log In")).toBeTruthy();
    expect(getByText("Don't have an account? ")).toBeTruthy();
    expect(getByText("Register")).toBeTruthy();
  });

  it("shows validation errors when fields are empty", async () => {
    const { getByText, findByText } = render(<LoginScreen />);

    fireEvent.press(getByText("Log In"));

    expect(await findByText("Email is required.")).toBeTruthy();
    expect(await findByText("Password is required.")).toBeTruthy();
  });

  it("shows validation error for invalid email", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <LoginScreen />,
    );

    fireEvent.changeText(getByPlaceholderText("maya@example.com"), "bad-email");
    fireEvent.changeText(getByPlaceholderText("Enter password"), "123456");
    fireEvent.press(getByText("Log In"));

    expect(await findByText("Enter a valid email address.")).toBeTruthy();
  });

  it("shows validation error for short password", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <LoginScreen />,
    );

    fireEvent.changeText(
      getByPlaceholderText("maya@example.com"),
      "maya@test.com",
    );
    fireEvent.changeText(getByPlaceholderText("Enter password"), "123");
    fireEvent.press(getByText("Log In"));

    expect(
      await findByText("Password must be at least 6 characters."),
    ).toBeTruthy();
  });

  it("calls loginUser with correct values", async () => {
    loginUser.mockResolvedValue({ token: "mock-token" });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(
      getByPlaceholderText("maya@example.com"),
      "maya@test.com",
    );
    fireEvent.changeText(getByPlaceholderText("Enter password"), "123456");
    fireEvent.press(getByText("Log In"));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("maya@test.com", "123456");
    });
  });

  it("calls signIn with token after successful login", async () => {
    loginUser.mockResolvedValue({ token: "mock-token" });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(
      getByPlaceholderText("maya@example.com"),
      "maya@test.com",
    );
    fireEvent.changeText(getByPlaceholderText("Enter password"), "123456");
    fireEvent.press(getByText("Log In"));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("mock-token");
    });
  });

  it("redirects to countries after successful login", async () => {
    loginUser.mockResolvedValue({ token: "mock-token" });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(
      getByPlaceholderText("maya@example.com"),
      "maya@test.com",
    );
    fireEvent.changeText(getByPlaceholderText("Enter password"), "123456");
    fireEvent.press(getByText("Log In"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/countries");
    });
  });

  it("shows server error when login fails", async () => {
    loginUser.mockRejectedValue(new Error("Invalid email or password"));

    const { getByPlaceholderText, getByText, findByText } = render(
      <LoginScreen />,
    );

    fireEvent.changeText(
      getByPlaceholderText("maya@example.com"),
      "maya@test.com",
    );
    fireEvent.changeText(getByPlaceholderText("Enter password"), "123456");
    fireEvent.press(getByText("Log In"));

    expect(await findByText("Invalid email or password")).toBeTruthy();
  });

  it("shows loading label while login is in progress", async () => {
    let resolvePromise;

    loginUser.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(
      getByPlaceholderText("maya@example.com"),
      "maya@test.com",
    );
    fireEvent.changeText(getByPlaceholderText("Enter password"), "123456");
    fireEvent.press(getByText("Log In"));

    expect(getByText("Logging In...")).toBeTruthy();

    resolvePromise({ token: "mock-token" });

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalled();
    });
  });
});
