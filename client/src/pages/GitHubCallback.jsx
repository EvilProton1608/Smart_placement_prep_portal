import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/Auth.css";

export default function GitHubCallback() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleGitHubCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code) {
          setError(" No authorization code received from GitHub");
          setLoading(false);
          return;
        }

        // Exchange code for access token (this should be done on backend)
        // For security, you should never expose your GitHub client secret on the frontend
        // Instead, send the code to your backend where it exchanges it for a token

        const response = await axios.post(
          "http://localhost:5000/api/oauth/github/callback",
          { code }
        );

        if (response.data && response.data.token) {
          localStorage.setItem("token", response.data.token);
          
          // Redirect to home or dashboard
          setTimeout(() => {
            navigate("/");
          }, 1000);
        }
      } catch (err) {
        console.error("GitHub callback error:", err);
        setError(
          err.response?.data?.message || "GitHub authentication failed"
        );
      } finally {
        setLoading(false);
      }
    };

    handleGitHubCallback();
  }, [searchParams, navigate]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="auth-container" style={{ textAlign: "center" }}>
        {loading ? (
          <>
            <h2>Authenticating with GitHub...</h2>
            <p className="auth-subtitle">Please wait while we verify your account</p>
            <div style={{ margin: "20px 0" }}>
              <div className="spinner"></div>
            </div>
          </>
        ) : error ? (
          <>
            <h2>Authentication Failed</h2>
            <div className="alert alert-error">{error}</div>
            <button
              onClick={() => navigate("/register")}
              className="btn-submit"
            >
              Back to Register
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
