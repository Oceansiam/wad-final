// src/pages/CourseListPage.jsx
// One page, three views:
//   teacher            -> "My courses"          (backend returns only their own)
//   student            -> "Browse courses"      (everything except Cancel)
//   student, enrolled  -> "My enrolled courses" (mode="enrolled")
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, pickList } from "../api";
import { useUser } from "../context/useUser";
import CourseCard from "../components/CourseCard";
import { PlusIcon, SearchIcon } from "../components/Icons";
import { STATUSES, teacherName } from "../utils/course";

export default function CourseListPage({ mode = "all" }) {
  const { isTeacher, isStudent } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const enrolledView = isStudent && mode === "enrolled";
  const browseView = isStudent && !enrolledView;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  // A message passed from another page, e.g. after deleting a course.
  const [flash] = useState(location.state?.flash ?? "");

  useEffect(() => {
    // Clear the flash from history so it doesn't come back on refresh.
    if (location.state?.flash) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    let cancelled = false;
    const load = enrolledView ? api.getEnrolledCourses() : api.getCourses();
    load
      .then((data) => {
        if (!cancelled) setCourses(pickList(data, "courses"));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enrolledView]);

  // Students never see cancelled courses in the browse list. The backend
  // should already leave them out; this is a second safety net.
  const visible = useMemo(
    () => (browseView ? courses.filter((c) => c.status !== "cancel") : courses),
    [courses, browseView],
  );

  // Status chips: students browsing can't see Cancel, so no chip for it.
  const filters = [
    { value: "all", label: "All" },
    ...STATUSES.filter((s) => !(browseView && s.value === "cancel")),
  ];

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visible.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!q) return true;
      // Students: search course name or teacher name (assignment requirement).
      // Teachers: search course name or topics (all courses are their own).
      const extra = isTeacher
        ? (Array.isArray(c.topics) ? c.topics.join(" ") : "")
        : teacherName(c);
      return `${c.course_name ?? ""} ${extra}`.toLowerCase().includes(q);
    });
  }, [visible, filter, query, isTeacher]);

  const title = isTeacher ? "My courses" : enrolledView ? "My enrolled courses" : "Browse courses";
  const subtitle = isTeacher
    ? "Courses you have created. Only you can see and edit them."
    : enrolledView
      ? "Courses you have enrolled in."
      : "Open courses take new students. Closed courses are shown but can't be joined.";

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {isTeacher && (
          <Link to="/courses/new" className="btn btn-primary">
            <PlusIcon size={18} /> New course
          </Link>
        )}
      </div>

      {flash && (
        <div className="alert alert--success" role="status">
          {flash}
        </div>
      )}

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filter by status">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              className={"chip" + (filter === f.value ? " chip--active" : "")}
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="search">
          <SearchIcon size={18} />
          <input
            type="search"
            aria-label={isTeacher ? "Search by course name or topic" : "Search by course or teacher name"}
            placeholder={isTeacher ? "Search by name or topic…" : "Search course or teacher name…"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {loading && <p className="muted">Loading courses…</p>}

      {!loading && error && (
        <div className="alert alert--error" role="alert">
          Could not load courses: {error}
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="empty card">
          <h2>
            {isTeacher ? "No courses yet" : enrolledView ? "You haven't enrolled yet" : "No courses available"}
          </h2>
          <p className="muted">
            {isTeacher
              ? "Create your first course and it will show up here."
              : enrolledView
                ? "Courses you enroll in will show up here."
                : "Check back later. No courses have been published yet."}
          </p>
          {isTeacher && (
            <Link to="/courses/new" className="btn btn-primary">
              <PlusIcon size={18} /> Create a course
            </Link>
          )}
          {enrolledView && (
            <Link to="/courses" className="btn btn-primary">
              Browse courses
            </Link>
          )}
        </div>
      )}

      {!loading && !error && visible.length > 0 && shown.length === 0 && (
        <p className="muted">No courses match your search or filter.</p>
      )}

      {shown.length > 0 && (
        <div className="course-grid">
          {shown.map((c) => (
            <CourseCard key={c._id ?? c.id} course={c} showTeacher={isStudent} />
          ))}
        </div>
      )}
    </>
  );
}
