import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, role } = useAuth(); // ✅ get both user & role from context

  // ⏳ If user info isn't loaded yet
  if (user === undefined) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "4rem",
          color: "#aaa",
          fontSize: "1.2rem",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  // 🔒 If not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 If role restriction exists and user doesn't match → redirect home
  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Otherwise, allow access
  return children;
}
