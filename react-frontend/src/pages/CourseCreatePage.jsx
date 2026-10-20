// src/pages/CourseCreatePage.jsx (teacher only)
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import CourseForm from "../components/CourseForm";

export default function CourseCreatePage() {
  const navigate = useNavigate();

  async function handleCreate(course) {
    const data = await api.createCourse(course);
    // Your POST returns { id: insertedId } — open the new course.
    const newId = data?.id ?? data?._id ?? data?.insertedId;
    navigate(newId ? `/courses/${newId}` : "/courses", { replace: true });
  }

  return (
    <div className="form-wrap">
      <div className="form-column">
        <div className="page-header">
          <div>
            <h1>New course</h1>
            <p>Fill in the details. You can change everything later.</p>
          </div>
        </div>
        <CourseForm submitLabel="Create course" cancelTo="/courses" onSubmit={handleCreate} />
      </div>
    </div>
  );
}
