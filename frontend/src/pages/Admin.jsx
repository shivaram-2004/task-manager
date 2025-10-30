import React from "react";
import { Box, Tabs, Tab, Typography, Paper } from "@mui/material";
import AdminDashboard from "./AdminDashboard.jsx"; // ✅ Updated import
import Analytics from "./Analytics.jsx";

export default function Admin() {
  const [tab, setTab] = React.useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        py: 4,
        px: { xs: 2, md: 6 },
        background: (theme) =>
          theme.palette.mode === "dark"
            ? theme.palette.background.default
            : `
              linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,245,245,0.7)),
              radial-gradient(circle at top left, rgba(255,255,255,0.4), transparent 70%),
              radial-gradient(circle at bottom right, rgba(255,255,255,0.4), transparent 70%)
            `,
        transition: "background-color 0.3s ease",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 2,
          borderRadius: 3,
          background: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : "rgba(255,255,255,0.6)",
          mb: 4,
          textAlign: "center",
          color: (theme) => theme.palette.text.primary,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            letterSpacing: 0.5,
            background: "linear-gradient(90deg, #4169E1, #1E90FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Admin Panel
        </Typography>
      </Paper>

      {/* 🔹 Tabs for Navigation */}
      <Tabs
        value={tab}
        onChange={handleChange}
        centered
        textColor="primary"
        indicatorColor="primary"
        sx={{
          mb: 3,
          "& .MuiTab-root": { fontWeight: 600, color: "#4169E1" },
        }}
      >
        <Tab label="Dashboard" />
        <Tab label="Analytics" />
      </Tabs>

      {/* 🔹 Render based on active tab */}
      {tab === 0 && <AdminDashboard />} {/* ✅ Fixed */}
      {tab === 1 && <Analytics />}
    </Box>
  );
}
