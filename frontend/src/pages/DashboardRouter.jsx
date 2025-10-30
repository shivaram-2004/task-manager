import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard.jsx";
import MemberDashboard from "./MemberDashboard.jsx";
import ActivityLog from "./ActivityLog.jsx"; // ✅ make sure this file exists
import { useAuth } from "../contexts/AuthContext.jsx";
import Analytics from "./Analytics.jsx";
import UserManagement from "./UserManagement.jsx";



export default function DashboardRouter() {
  const { role } = useAuth();

  if (role === "admin") {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/activity-log" element={<ActivityLog />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


  if (role === "member") {
    return (
      <Routes>
        <Route path="/" element={<MemberDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Default redirect for unknown or unauthenticated users
  return <Navigate to="/login" replace />;
}
