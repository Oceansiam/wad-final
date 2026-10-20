// src/context/user-context.js
// The context object lives in its own file so React Fast Refresh keeps working
// (UserContext.jsx should only export components).
import { createContext } from "react";

export const UserContext = createContext(null);
