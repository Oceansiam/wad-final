// src/pages/NotFoundPage.jsx
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="empty card">
      <h2>Page not found</h2>
      <p className="muted">That page doesn't exist.</p>
      <Link to="/courses" className="btn btn-primary">
        Go to courses
      </Link>
    </div>
  );
}
