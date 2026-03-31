import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { registerUser } from "../services/authService";
import { googleAuth } from "../services/oauthService";
import "../styles/Auth.css";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (form.name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return false;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Invalid email format");
      return false;
    }
    if (!form.password) {
      setError("Password is required");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser(form);

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        setSuccess("✓ Registration successful! Redirecting...");
        setForm({ name: "", email: "", password: "" });

        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Registration failed. Please try again.";
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError("");

      // Decode the JWT to get user data
      const decoded = jwtDecode(credentialResponse.credential);

      // Send to backend
      const response = await googleAuth(decoded);

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        setSuccess("✓ Google login successful! Redirecting...");

        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (err) {
      console.error("Google auth error:", err);
      const errorMessage =
        err.response?.data?.message || "Google authentication failed";
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("❌ Google login failed");
  };

  const handleGitHubLogin = () => {
    // Redirect to GitHub OAuth (you'll need to set this up in GitHub settings)
    const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const REDIRECT_URI = `${window.location.origin}/auth/github/callback`;
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user:email`;
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthLayout>
        <div className="auth-container">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join Smart Placement Prep Portal</p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* OAuth Buttons */}
          <div className="oauth-section">
            <div className="oauth-divider">
              <span>Or continue with</span>
            </div>

            <div className="oauth-buttons">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signup_with"
                theme="outline"
                size="large"
              />
              <button
                type="button"
                onClick={handleGitHubLogin}
                className="oauth-button github-button"
                disabled={loading}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>

          <div className="form-divider">
            <span>Or register with email</span>
          </div>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter a strong password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <small>Min 6 characters</small>
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </p>
        </div>
      </AuthLayout>
    </GoogleOAuthProvider>
  );
}
