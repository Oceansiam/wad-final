// src/pages/CourseDetailPage.jsx
// Teacher: course info + enrolled students + Edit / Delete.
// Student: course info + Enroll button.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useUser } from "../context/useUser";
import StatusBadge from "../components/StatusBadge";
import { ArrowLeftIcon, CheckIcon, ClockIcon, EditIcon, TagIcon, TrashIcon, UsersIcon } from "../components/Icons";
import { enrolledCount, enrolledIds, formatDays, formatPrice, statusLabel, teacherName } from "../utils/course";

// The detail response can carry the students as a separate "students" list,
// or as objects inside course.enrolled_students. Accept both.
function pickStudents(data, course) {
  if (Array.isArray(data?.students)) return data.students;
  if (Array.isArray(course?.enrolled_students)) {
    return course.enrolled_students.filter((s) => s && typeof s === "object");
  }
  return [];
}

// The `key` makes React start fresh when the URL switches to another course,
// so no state (form values, loading flags) leaks from the previous one.
export default function CourseDetailPage() {
  const { courseId } = useParams();
  return <CourseDetailPageContent key={courseId} courseId={courseId} />;
}

function CourseDetailPageContent({ courseId }) {
  const { user, isTeacher, isStudent } = useUser();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionDone, setActionDone] = useState("");

  // Bumping this number re-fetches the course (used after enrolling).
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .getCourse(courseId)
      .then((data) => {
        if (cancelled) return;
        const c = data?.course ?? data;
        setCourse(c);
        setStudents(pickStudents(data, c));
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, reloadKey]);

  if (loading) return <p className="muted">Loading course…</p>;

  if (loadError) {
    const title =
      loadError.status === 404
        ? "Course not found"
        : loadError.status === 403
          ? "You can't view this course"
          : "Could not load this course";
    return (
      <div className="empty card">
        <h2>{title}</h2>
        <p className="muted">
          {loadError.status === 403 ? "Teachers can only open their own courses." : loadError.message}
        </p>
        <Link to="/courses" className="btn btn-outline">
          <ArrowLeftIcon size={18} /> Back to courses
        </Link>
      </div>
    );
  }

  const enrolled = enrolledCount(course);
  const max = Number(course.max_student) || 0;
  const seatsLeft = Math.max(0, max - enrolled);
  const topics = Array.isArray(course.topics) ? course.topics : [];
  // The API can send `is_enrolled: true`, or the list of enrolled ids.
  const alreadyEnrolled = course.is_enrolled === true || enrolledIds(course).includes(String(user?.id));
  const teacher = teacherName(course);

  async function handleDelete() {
    setBusy(true);
    setActionError("");
    try {
      await api.deleteCourse(courseId);
      navigate("/courses", { replace: true, state: { flash: `"${course.course_name}" was deleted.` } });
    } catch (err) {
      setActionError(err.message);
      setBusy(false);
      setConfirmDelete(false);
    }
  }

  async function handleEnroll() {
    setBusy(true);
    setActionError("");
    try {
      await api.enroll(courseId);
      setActionDone("You're enrolled. Find it under “My enrolled courses”.");
      setReloadKey((k) => k + 1);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Why a student can't enroll (null = they can)
  let enrollBlock = null;
  if (alreadyEnrolled) enrollBlock = "You're already enrolled.";
  else if (course.status === "cancel") enrollBlock = "This course has been cancelled.";
  else if (course.status === "close") enrollBlock = "This course is closed for enrollment.";
  else if (course.status !== "open") enrollBlock = `This course is ${statusLabel(course.status).toLowerCase()}.`;
  else if (max > 0 && seatsLeft === 0) enrollBlock = "This course is full.";

  return (
    <>
      <Link to="/courses" className="back-link">
        <ArrowLeftIcon size={18} /> {isTeacher ? "My courses" : "All courses"}
      </Link>

      <div className="detail-layout">
        <article className="detail-main">
          <header className="card detail-hero">
            <StatusBadge status={course.status} />
            <h1>{course.course_name}</h1>
            {teacher && !isTeacher && <p className="detail-hero__teacher">Taught by {teacher}</p>}
            <ul className="fact-row">
              <li>
                <ClockIcon size={18} /> {formatDays(course.duration_days)}
              </li>
              <li>
                <TagIcon size={18} /> {formatPrice(course.price)}
              </li>
              <li>
                <UsersIcon size={18} /> {enrolled} / {max || "—"} students
              </li>
            </ul>
          </header>

          <section className="card">
            <h2 className="section-title">Topics</h2>
            {topics.length > 0 ? (
              <ul className="topic-list">
                {topics.map((t) => (
                  <li key={t} className="topic">
                    {t}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No topics listed.</p>
            )}
          </section>

          {isTeacher && (
            <section className="card">
              <div className="section-head">
                <h2 className="section-title">Enrolled students</h2>
                <span className="count-pill">{enrolled}</span>
              </div>
              {enrolled === 0 ? (
                <p className="muted">No students have enrolled yet.</p>
              ) : students.length === 0 ? (
                <p className="muted">
                  {enrolled} enrolled. (The API didn't send their names — see FRONTEND_NOTES.md.)
                </p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Username</th>
                        <th scope="col">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr key={s._id ?? s.id ?? i}>
                          <td className="muted">{i + 1}</td>
                          <td className="strong">{s.username}</td>
                          <td>{s.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </article>

        <aside className="detail-aside card">
          <h2 className="section-title">Course info</h2>
          <dl className="info-list">
            <dt>Status</dt>
            <dd>{statusLabel(course.status)}</dd>
            <dt>Duration</dt>
            <dd>{formatDays(course.duration_days)}</dd>
            <dt>Price</dt>
            <dd>{formatPrice(course.price)}</dd>
            <dt>Seats left</dt>
            <dd>
              {seatsLeft} of {max || "—"}
            </dd>
          </dl>

          {actionError && (
            <div className="alert alert--error" role="alert">
              {actionError}
            </div>
          )}
          {actionDone && (
            <div className="alert alert--success" role="status">
              <CheckIcon size={18} /> {actionDone}
            </div>
          )}

          {isStudent && (
            <div className="aside-actions">
              <button
                type="button"
                className="btn btn-primary btn-block"
                disabled={busy || !!enrollBlock}
                onClick={handleEnroll}
              >
                {alreadyEnrolled ? "Enrolled" : busy ? "Enrolling…" : "Enroll in course"}
              </button>
              {enrollBlock && !alreadyEnrolled && <p className="muted small">{enrollBlock}</p>}
              {alreadyEnrolled && (
                <Link to="/enrolled" className="btn btn-outline btn-block">
                  My enrolled courses
                </Link>
              )}
            </div>
          )}

          {isTeacher && (
            <div className="aside-actions">
              <Link to={`/courses/${courseId}/edit`} className="btn btn-outline btn-block">
                <EditIcon size={18} /> Edit course
              </Link>

              {!confirmDelete ? (
                <>
                  <button
                    type="button"
                    className="btn btn-danger btn-block"
                    disabled={enrolled > 0 || busy}
                    onClick={() => setConfirmDelete(true)}
                  >
                    <TrashIcon size={18} /> Delete course
                  </button>
                  {enrolled > 0 && (
                    <p className="muted small">
                      You can't delete a course once students have enrolled.
                    </p>
                  )}
                </>
              ) : (
                <div className="confirm-box" role="alertdialog" aria-label="Confirm delete">
                  <p>
                    Delete <strong>{course.course_name}</strong>? This can't be undone.
                  </p>
                  <div className="confirm-box__actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setConfirmDelete(false)}
                      disabled={busy}
                    >
                      Keep it
                    </button>
                    <button type="button" className="btn btn-danger-solid" onClick={handleDelete} disabled={busy}>
                      {busy ? "Deleting…" : "Yes, delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
