// src/components/CourseForm.jsx — used by both "New course" and "Edit course"
import { useState } from "react";
import { Link } from "react-router-dom";
import { STATUSES } from "../utils/course";
import { PlusIcon, XIcon } from "./Icons";

const EMPTY = {
  course_name: "",
  duration_days: "",
  topics: [],
  price: "",
  max_student: "",
  status: "open",
};

// Turns a course from the API into form values (numbers -> strings for inputs)
function toFormValues(course) {
  if (!course) return EMPTY;
  return {
    course_name: course.course_name ?? "",
    duration_days: course.duration_days ?? "",
    topics: Array.isArray(course.topics) ? course.topics : [],
    price: course.price ?? "",
    max_student: course.max_student ?? "",
    status: course.status ?? "open",
  };
}

function validate(values, enrolled) {
  const errors = {};
  if (!values.course_name.trim()) errors.course_name = "Course name is required.";

  const days = Number(values.duration_days);
  if (values.duration_days === "" || !Number.isInteger(days) || days < 1)
    errors.duration_days = "Enter a whole number of days (1 or more).";

  const price = Number(values.price);
  if (values.price === "" || !Number.isFinite(price) || price < 0)
    errors.price = "Enter a price of 0 or more.";

  const max = Number(values.max_student);
  if (values.max_student === "" || !Number.isInteger(max) || max < 1)
    errors.max_student = "Enter a whole number of students (1 or more).";
  else if (max < enrolled)
    errors.max_student = `${enrolled} students are already enrolled — the limit can't be lower.`;

  if (values.topics.length === 0) errors.topics = "Add at least one topic.";
  return errors;
}

export default function CourseForm({
  initialCourse,
  enrolled = 0,
  submitLabel,
  cancelTo,
  onSubmit,
}) {
  const [values, setValues] = useState(() => toFormValues(initialCourse));
  const [topicDraft, setTopicDraft] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function addTopic() {
    const topic = topicDraft.trim();
    if (!topic) return;
    if (!values.topics.some((t) => t.toLowerCase() === topic.toLowerCase())) {
      setField("topics", [...values.topics, topic]);
    }
    setTopicDraft("");
  }

  function removeTopic(topic) {
    setField(
      "topics",
      values.topics.filter((t) => t !== topic),
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // A topic typed but not added yet still counts.
    const topics = topicDraft.trim() ? [...new Set([...values.topics, topicDraft.trim()])] : values.topics;
    const final = { ...values, topics };
    const found = validate(final, enrolled);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setServerError("");
    try {
      // Send numbers as numbers and topics as an array of strings.
      await onSubmit({
        course_name: final.course_name.trim(),
        duration_days: Number(final.duration_days),
        topics: final.topics,
        price: Number(final.price),
        max_student: Number(final.max_student),
        status: final.status,
      });
    } catch (err) {
      setServerError(err.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div className="alert alert--error" role="alert">
          {serverError}
        </div>
      )}

      <section className="card form-section">
        <h2 className="section-title">Course details</h2>

        <div className="field">
          <label htmlFor="course_name">Course name</label>
          <input
            id="course_name"
            value={values.course_name}
            onChange={(e) => setField("course_name", e.target.value)}
            placeholder="e.g. React Fundamentals"
            aria-invalid={!!errors.course_name}
          />
          {errors.course_name && <p className="field-error">{errors.course_name}</p>}
        </div>

        <div className="field">
          <label htmlFor="topic-input">Topics</label>
          <div className="topic-input">
            <input
              id="topic-input"
              value={topicDraft}
              onChange={(e) => setTopicDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTopic();
                }
              }}
              placeholder="Type a topic and press Enter"
              aria-invalid={!!errors.topics}
            />
            <button type="button" className="btn btn-outline" onClick={addTopic}>
              <PlusIcon size={18} /> Add
            </button>
          </div>
          {values.topics.length > 0 && (
            <ul className="topic-list" aria-label="Added topics">
              {values.topics.map((t) => (
                <li key={t} className="topic topic--removable">
                  {t}
                  <button type="button" onClick={() => removeTopic(t)} aria-label={`Remove ${t}`}>
                    <XIcon size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {errors.topics && <p className="field-error">{errors.topics}</p>}
        </div>
      </section>

      <section className="card form-section">
        <h2 className="section-title">Schedule, price &amp; seats</h2>
        <div className="field-row">
          <div className="field">
            <label htmlFor="duration_days">Duration (days)</label>
            <input
              id="duration_days"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={values.duration_days}
              onChange={(e) => setField("duration_days", e.target.value)}
              aria-invalid={!!errors.duration_days}
            />
            {errors.duration_days && <p className="field-error">{errors.duration_days}</p>}
          </div>
          <div className="field">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={values.price}
              onChange={(e) => setField("price", e.target.value)}
              aria-invalid={!!errors.price}
            />
            {errors.price && <p className="field-error">{errors.price}</p>}
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="max_student">Max students</label>
            <input
              id="max_student"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={values.max_student}
              onChange={(e) => setField("max_student", e.target.value)}
              aria-invalid={!!errors.max_student}
            />
            {errors.max_student && <p className="field-error">{errors.max_student}</p>}
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" value={values.status} onChange={(e) => setField("status", e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="form-actions">
        <Link to={cancelTo} className="btn btn-outline">
          Cancel
        </Link>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
