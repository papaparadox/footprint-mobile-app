jest.mock("expo-router", () => ({
  Link: ({ children }) => children,
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
}));