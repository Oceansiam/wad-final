//src/App.jsx

import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import AppLayout from "./components/AppLayout";
import RequireAuth from "./components/RequireAuth";
import LoginPage from "./pages/LoginPage";
import CourseListPage from "./pages/CourseListPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CourseCreatePage from "./pages/CourseCreatePage";
import CourseEditPage from "./pages/CourseEditPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Logged in (any role): sidebar + top bar around every page */}
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Navigate to="/courses" replace />} />
          {/* Same page, two modes. The keys stop React reusing one list's data for the other. */}
          <Route path="/courses" element={<CourseListPage key="all" />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />

          {/* Student only */}
          <Route element={<RequireAuth role="student" />}>
            <Route path="/enrolled" element={<CourseListPage key="enrolled" mode="enrolled" />} />
          </Route>

          {/* Teacher only */}
          <Route element={<RequireAuth role="teacher" />}>
            <Route path="/courses/new" element={<CourseCreatePage />} />
            <Route path="/courses/:courseId/edit" element={<CourseEditPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
