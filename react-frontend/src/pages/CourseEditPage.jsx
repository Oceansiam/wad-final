// src/pages/CourseEditPage.jsx (teacher only)
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import CourseForm from "../components/CourseForm";
import { ArrowLeftIcon } from "../components/Icons";
import { enrolledCount } from "../utils/course";

// The `key` makes React start fresh when the URL switches to another course,
// so no state (form values, loading flags) leaks from the previous one.
export default function CourseEditPage() {
  const { courseId } = useParams();
  return <CourseEditPageContent key={courseId} courseId={courseId} />;
}

function CourseEditPageContent({ courseId }) {
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getCourse(courseId)
      .then((data) => {
        if (!cancelled) setCourse(data?.course ?? data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  async function handleUpdate(values) {
    await api.updateCourse(courseId, values);
    navigate(`/courses/${courseId}`, { replace: true });
  }

  if (error) {
    return (
      <div className="empty card">
        <h2>{error.status === 404 ? "Course not found" : "Could not load this course"}</h2>
        <p className="muted">{error.message}</p>
        <Link to="/courses" className="btn btn-outline">
          <ArrowLeftIcon size={18} /> Back to courses
        </Link>
      </div>
    );
  }
  if (!course) return <p className="muted">Loading course…</p>;

  return (
    <div className="form-wrap">
      <div className="form-column">
        <Link to={`/courses/${courseId}`} className="back-link">
          <ArrowLeftIcon size={18} /> Back to course
        </Link>
        <div className="page-header">
          <div>
            <h1>Edit course</h1>
            <p>{course.course_name}</p>
          </div>
        </div>
        <CourseForm
          initialCourse={course}
          enrolled={enrolledCount(course)}
          submitLabel="Save changes"
          cancelTo={`/courses/${courseId}`}
          onSubmit={handleUpdate}
        />
      </div>
    </div>
  );
}
