// src/pages/LoginPage.jsx
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/useUser";
import { LogoIcon } from "../components/Icons";

export default function LoginPage() {
  const { user, login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in? Skip the login page.
  if (user) return <Navigate to="/courses" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email.trim(), password);
      navigate(location.state?.from || "/courses", { replace: true });
    } catch (err) {
      setError(
        err.status === 401 || err.status === 400
          ? "Wrong email or password."
          : err.message || "Login failed. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-brand">
        <div className="brand brand--light">
          <span className="brand__mark">
            <LogoIcon size={22} />
          </span>
          CourseHub
        </div>
        <div className="login-brand__copy">
          <h1>Learn at your own pace.</h1>
          <p>Teachers publish courses. Students find one and enroll. Everything in one place.</p>
        </div>
        <p className="login-brand__foot">Online Course Service</p>
      </section>

      <main className="login-form-side">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div>
            <h2>Sign in</h2>
            <p className="muted">Welcome back. Enter your account details.</p>
          </div>

          {error && (
            <div className="alert alert--error" role="alert">
              {error}
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="muted small center">Test accounts are listed in the project README.</p>
        </form>
      </main>
    </div>
  );
}
