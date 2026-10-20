// src/components/RequireAuth.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/useUser";

// Wrap routes with this to require login. Pass role="teacher" to also
// require a role — students get sent back to the course list.
export default function RequireAuth({ role, children }) {
  const { user } = useUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/courses" replace />;
  }
  return children ?? <Outlet />;
}
