import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const TOKEN_STORAGE_KEY = "chat_token";

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_STORAGE_KEY) || "");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const storeToken = (sessionToken) => {
    if (sessionToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, sessionToken);
      setToken(sessionToken);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken("");
    }
  };

  const refreshAccessToken = async () => {
    const data = await apiRequest("/auth/refresh", {
      method: "POST",
    });
    storeToken(data.token);
    return data.token;
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrapSession = async () => {
      setAuthLoading(true);
      setAuthError("");

      let activeToken = token;

      if (!activeToken) {
        try {
          activeToken = await refreshAccessToken();
        } catch {
          if (!cancelled) {
            storeToken("");
            setUser(null);
            setAuthLoading(false);
          }
          return;
        }
      }

      try {
        const data = await apiRequest("/auth/me", { token: activeToken });
        if (!cancelled) {
          setUser(data.user);
          setAuthError("");
        }
      } catch (error) {
        try {
          const nextToken = await refreshAccessToken();
          const data = await apiRequest("/auth/me", { token: nextToken });
          if (!cancelled) {
            setUser(data.user);
            setAuthError("");
          }
        } catch {
          if (!cancelled) {
            storeToken("");
            setUser(null);
            setAuthError(error.message || "Session expired");
          }
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const persistSession = (sessionToken, sessionUser) => {
    storeToken(sessionToken);
    setUser(sessionUser);
    setAuthError("");
  };

  const login = async ({ username, password }) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: { username, password },
    });
    persistSession(data.token, data.user);
    return data.user;
  };

  const register = async ({ username, password, email, phone }) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: { username, password, email, phone },
    });
    persistSession(data.token, data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
        token,
      });
    } finally {
      storeToken("");
      setUser(null);
    }
  };

  const requestPasswordReset = async ({ username }) => {
    return apiRequest("/auth/forgot-password/request", {
      method: "POST",
      body: { username },
    });
  };

  const resetForgotPassword = async ({ username, token: resetToken, newPassword }) => {
    return apiRequest("/auth/forgot-password/reset", {
      method: "POST",
      body: { username, token: resetToken, newPassword },
    });
  };

  return {
    token,
    user,
    authLoading,
    authError,
    login,
    register,
    logout,
    requestPasswordReset,
    resetForgotPassword,
  };
}
