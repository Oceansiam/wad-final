// src/api.js
// Every call to the backend goes through this file, so if a URL or a
// response shape changes on the API side, this is the only place to edit.

const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      // Sends the "token" cookie to the backend (needed because the frontend
      // runs on :5173 and the backend on :3000).
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the backend running?", 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Some responses have no body — that's fine.
  }

  if (!res.ok) {
    // 401 = not logged in (or the cookie expired). UserContext listens for
    // this and logs the user out of the frontend.
    if (res.status === 401 && path !== "/api/auth/login") {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status);
  }
  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: { email, password } }),
  logout: () => request("/api/auth/logout", { method: "POST" }),

  // Courses
  getCourses: () => request("/api/course"),
  getCourse: (courseId) => request(`/api/course/${courseId}`),
  createCourse: (course) => request("/api/course", { method: "POST", body: course }),
  updateCourse: (courseId, course) =>
    request(`/api/course/${courseId}`, { method: "PUT", body: course }),
  deleteCourse: (courseId) => request(`/api/course/${courseId}`, { method: "DELETE" }),

  // Student
  enroll: (courseId) => request(`/api/course/${courseId}/enroll`, { method: "POST" }),
  getEnrolledCourses: () => request("/api/course?enrolled=true"),
};

// The backend may wrap lists ({ courses: [...] }) or not ([...]) — accept both.
export function pickList(data, key) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  return [];
}
