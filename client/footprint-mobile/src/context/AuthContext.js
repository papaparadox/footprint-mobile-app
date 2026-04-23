import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, saveToken, removeToken } from "../services/tokenService";
import { getProfile } from "../services/userService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadToken() {
      try {
        const storedToken = await getToken();

        if (!storedToken) {
          setToken(null);
          return;
        }

        try {
          await getProfile();
          setToken(storedToken);
        } catch (error) {
          await removeToken();
          setToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadToken();
  }, []);

  async function signIn(newToken) {
    await saveToken(newToken);
    setToken(newToken);
  }

  async function signOut() {
    await removeToken();
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
