import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  CircularProgress,
} from "@mui/material";
import theme, { useColorMode } from "./theme";

// 📊 Pages
import Analytics from "./pages/Analytics.jsx";
import TopNav from "./components/TopNav.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Admin from "./pages/Admin.jsx";
import Settings from "./pages/Settings.jsx";
import Activity from "./pages/ActivityLog.jsx";
import UserManagement from "./pages/UserManagement.jsx";

// 🧭 Role-based dashboards
import DashboardRouter from "./pages/DashboardRouter.jsx";

// 🧠 Auth Context
import { useAuth } from "./contexts/AuthContext.jsx";

export default function App() {
  const { muiTheme } = useColorMode();
  const { user } = useAuth();
  const location = useLocation();

  // 🔄 Show spinner while Firebase is verifying auth state
  if (user === undefined) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(15px)",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // 🔐 Redirect to login if not logged in and not already on a public route
  const publicPaths = ["/login", "/signup", "/forgot-password"];
  const isPublicRoute = publicPaths.includes(location.pathname);

  if (!user && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />

      {/* 🌈 Global Glassmorphic Background */}
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          background: "rgba(255, 255, 255, 0.1)",
          WebkitBackdropFilter: "blur(25px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          backdropFilter: "blur(25px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          overflowX: "hidden",
          transition: "background 0.3s ease-in-out",
        }}
      >
        {/* 🧭 Floating Transparent Navigation Bar */}
        <TopNav />

        {/* 💎 Main Container */}
        <Container
          maxWidth="lg"
          sx={{
            py: 4,
            px: 3,
            mt: 3,
            borderRadius: "20px",
            background: "rgba(255,255,255,0.25)",
            border: "1px solid rgba(255,255,255,0.4)",
            boxShadow: "0 8px 32px rgba(31,38,135,0.37)",
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
          }}
        >
          <Routes>
            {/* 🔓 Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* 🏠 Dashboard — auto route by role */}
            <Route
              path="/*"
              element={
                <ProtectedRoute roles={["admin", "member", "client"]}>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />
            {/* 👥 User Management (Admin Only) */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

            {/* 📊 Analytics (Admin Only) */}
            <Route
              path="/analytics"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            {/* 🕒 Activity Log (Admin Only) */}
            <Route
              path="/activity"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Activity />
                </ProtectedRoute>
              }
            />

            {/* ⚙️ Admin Panel (Admin Only) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />

            {/* 🔧 Settings (Admin + Member + Client) */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute roles={["admin", "member", "client"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* 🚧 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>

        {/* 🌟 Footer */}
        <Box
          component="footer"
          sx={{
            mt: 4,
            mb: 2,
            color: "rgba(210, 160, 160, 0.8)",
            fontSize: "0.9rem",
          }}
        >
          © {new Date().getFullYear()} Task Manager
        </Box>
      </Box>
    </ThemeProvider>
  );
}
