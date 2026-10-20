// src/components/CourseCard.jsx — one card in the course grid
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { ClockIcon, UsersIcon } from "./Icons";
import {
  courseId,
  courseInitials,
  courseTint,
  enrolledCount,
  formatDays,
  formatPrice,
  teacherName,
} from "../utils/course";

const MAX_TOPICS_SHOWN = 3;

export default function CourseCard({ course, showTeacher = false }) {
  const teacher = teacherName(course);
  const topics = Array.isArray(course.topics) ? course.topics : [];
  const extra = topics.length - MAX_TOPICS_SHOWN;
  const enrolled = enrolledCount(course);
  const max = Number(course.max_student) || 0;
  const fill = max > 0 ? Math.min(100, Math.round((enrolled / max) * 100)) : 0;

  return (
    <Link to={`/courses/${courseId(course)}`} className="course-card">
      <div className={`course-card__thumb ${courseTint(course)}`}>
        <span className="course-card__initials">{courseInitials(course)}</span>
        <StatusBadge status={course.status} />
      </div>

      <div className="course-card__body">
        <div className="course-card__title-row">
          <h2 className="course-card__title">{course.course_name}</h2>
          <span className="course-card__price">{formatPrice(course.price)}</span>
        </div>
        {showTeacher && teacher && <p className="course-card__teacher">by {teacher}</p>}

        {topics.length > 0 && (
          <ul className="topic-list" aria-label="Topics">
            {topics.slice(0, MAX_TOPICS_SHOWN).map((t) => (
              <li key={t} className="topic">
                {t}
              </li>
            ))}
            {extra > 0 && <li className="topic topic--more">+{extra} more</li>}
          </ul>
        )}

        <div className="course-card__meta">
          <span>
            <ClockIcon size={16} /> {formatDays(course.duration_days)}
          </span>
          <span>
            <UsersIcon size={16} /> {enrolled} / {max || "—"}
          </span>
        </div>
        <div
          className="seat-bar"
          role="progressbar"
          aria-label="Seats filled"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={fill}
        >
          <span style={{ width: `${fill}%` }} />
        </div>
      </div>
    </Link>
  );
}
