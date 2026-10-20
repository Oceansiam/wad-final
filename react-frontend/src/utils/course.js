// src/utils/course.js — small helpers shared by the course pages

// Change this if your prices are in another currency.
const CURRENCY = "THB";

export const STATUSES = [
  { value: "open", label: "Open" },
  { value: "close", label: "Closed" },
  { value: "cancel", label: "Cancelled" },
];

export function statusLabel(status) {
  return STATUSES.find((s) => s.value === status)?.label ?? status ?? "Unknown";
}

export function formatPrice(price) {
  const n = Number(price);
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY,
    currencyDisplay: "narrowSymbol", // ฿1,500 instead of THB 1,500.00
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDays(days) {
  const n = Number(days);
  if (!Number.isFinite(n)) return "—";
  return `${n} ${n === 1 ? "day" : "days"}`;
}

// enrolled_students may be ids (["abc"]) or objects ([{ _id, username }])
export function enrolledCount(course) {
  return Array.isArray(course?.enrolled_students) ? course.enrolled_students.length : 0;
}

export function enrolledIds(course) {
  if (!Array.isArray(course?.enrolled_students)) return [];
  return course.enrolled_students.map((s) => String(typeof s === "object" ? (s._id ?? s.id) : s));
}

// The backend adds the teacher's username to each course as `teacher_name`
// (looked up from users with teacher_id). `teacher.username` also works.
export function teacherName(course) {
  return course?.teacher_name ?? course?.teacher?.username ?? "";
}

export function courseId(course) {
  return String(course?._id ?? course?.id ?? "");
}

// Picks one of three soft colours from the course name, so cards differ.
const TINTS = ["tint-violet", "tint-amber", "tint-blue"];
export function courseTint(course) {
  const name = String(course?.course_name ?? "");
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return TINTS[sum % TINTS.length];
}

// "React Fundamentals" -> "RF"
export function courseInitials(course) {
  return String(course?.course_name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
