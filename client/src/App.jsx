import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import MainLayout from "./layouts/MainLayout";
import AnalyticsPage from "./pages/Analytics";
import AptitudePage from "./pages/Aptitude";
import ChangePassword from "./pages/ChangePassword";
import CodingPage from "./pages/Coding";
import Dashboard from "./pages/Dashboard";
import EditProfile from "./pages/EditProfile";
import GitHubCallback from "./pages/GitHubCallback";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Mocktest from "./pages/Mocktest";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import ProtectedRoute from "./utils/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/github/callback" element={<GitHubCallback />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/coding"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CodingPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/aptitude"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AptitudePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AnalyticsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mocktest"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Mocktest />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EditProfile />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ChangePassword />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-analyzer"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ResumeAnalyzer />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
