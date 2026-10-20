// src/components/AppLayout.jsx — sidebar + top bar around every logged-in page
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/useUser";
import { BookIcon, CheckIcon, LogoIcon, LogoutIcon, PlusIcon } from "./Icons";

export default function AppLayout() {
  const { user, isTeacher, logout } = useUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // "My courses" stays highlighted on a course's detail/edit page,
  // but not on the "New course" page.
  const onCourses = pathname.startsWith("/courses") && pathname !== "/courses/new";

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const initials = (user?.username || "?").slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark">
            <LogoIcon size={20} />
          </span>
          CourseHub
        </div>

        <nav aria-label="Main">
          <NavLink to="/courses" className={() => "nav-link" + (onCourses ? " active" : "")}>
            <BookIcon />
            {isTeacher ? "My courses" : "Browse courses"}
          </NavLink>
          {isTeacher ? (
            <NavLink to="/courses/new" className="nav-link">
              <PlusIcon />
              New course
            </NavLink>
          ) : (
            <NavLink to="/enrolled" className="nav-link">
              <CheckIcon />
              My enrolled courses
            </NavLink>
          )}
        </nav>

        <button type="button" className="nav-link nav-link--button" onClick={handleLogout}>
          <LogoutIcon />
          Log out
        </button>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <span className="role-pill">{isTeacher ? "Teacher account" : "Student account"}</span>
          <div className="user-chip">
            <span className="avatar" aria-hidden="true">
              {initials}
            </span>
            <div className="user-chip__text">
              <span className="user-chip__name">{user?.username}</span>
              <span className="user-chip__email">{user?.email}</span>
            </div>
          </div>
        </header>

        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
