//src/context/UserContext.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { UserContext } from "./user-context";

// The JWT lives in an httpOnly cookie that JavaScript can't read, so we keep a
// copy of the *public* user info (never the password or token) in
// localStorage. That way a page refresh doesn't log the user out of the UI.
const STORAGE_KEY = "coursehub.user";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function storeUser(user) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode / storage blocked — the app still works until refresh.
  }
}

// Makes the user object the same shape whatever the backend sends.
function normalizeUser(raw) {
  if (!raw) return null;
  return {
    id: String(raw.id ?? raw._id ?? ""),
    username: raw.username ?? "",
    email: raw.email ?? "",
    role: String(raw.role ?? "").toLowerCase(), // "teacher" | "student"
  };
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const clearUser = useCallback(() => {
    setUser(null);
    storeUser(null);
  }, []);

  // Any API call that gets a 401 sends us back to the login page.
  useEffect(() => {
    window.addEventListener("auth:unauthorized", clearUser);
    return () => window.removeEventListener("auth:unauthorized", clearUser);
  }, [clearUser]);

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    const loggedIn = normalizeUser(data?.user ?? data);
    if (!loggedIn?.role) {
      throw new Error("Login worked, but the response has no user role.");
    }
    setUser(loggedIn);
    storeUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Even if the request fails, log out on the frontend.
    }
    clearUser();
  }, [clearUser]);

  const value = useMemo(
    () => ({
      user,
      isTeacher: user?.role === "teacher",
      isStudent: user?.role === "student",
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
