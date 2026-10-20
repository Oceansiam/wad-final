// src/context/useUser.js
import { useContext } from "react";
import { UserContext } from "./user-context";

// Usage in any component:  const { user, isTeacher, login, logout } = useUser();
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}
