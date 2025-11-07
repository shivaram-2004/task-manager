import React from "react";
import {
  Box,
  Typography,
  Skeleton,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import FiltersBar from "../components/FiltersBar.jsx";
import TaskBoard from "../components/TaskBoard.jsx";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

export default function SharedDashboardLayout({
  user,
  role,
  filters,
  setFilters,
  tasks,
  loading,
  onUpdate,
  onDelete,
  onComment,
  onNewTask,
  showCreateButton = false,
  extraButton,
}) {
  const theme = useTheme();
  const navigate = useNavigate();

  // Greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };
  const greeting = getGreeting();
  const userName = user?.name || "User";

  // ✅ Filter tasks based on role
  const visibleTasks =
    role === "admin"
      ? tasks
      : tasks.filter(
          (t) =>
            t.assignedTo === user?.email ||
            t.assignedTo === user?.name ||
            t.assignees?.includes?.(user?.id) ||
            t.assignees?.includes?.(user?.email)
        );

  // ✅ Apply search and filters
  const filtered = visibleTasks.filter((t) => {
    const q = filters.q.toLowerCase();
    const matchesQ =
      !q || (t.title + " " + t.description).toLowerCase().includes(q);
    const matchesS = !filters.status || t.status === filters.status;
    const matchesP = !filters.priority || t.priority === filters.priority;
    return matchesQ && matchesS && matchesP;
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 3, md: 4 },
        py: 2,
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Greeting */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          letterSpacing: 0.5,
          mb: 1.5,
          color: theme.palette.text.primary,
        }}
      >
        {greeting}, {userName} 👋
      </Typography>

      {/* Compact task summary counters */}
      

      {/* Filters + Create Task + Activity Log */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
       <FiltersBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({ q: "", status: "", priority: "" })}
        onNewTask={onNewTask}
        showCreateButton={showCreateButton && role === "admin"} // ✅ only admin
      />

        <Stack direction="row" spacing={2}>
          {showCreateButton && role === "admin" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onNewTask}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(90deg,#2563eb,#60a5fa)"
                    : "linear-gradient(90deg,#22c55e,#4ade80)",
                 "&:hover": {
                  background:
                    theme.palette.mode === "dark"
                      ? "linear-gradient(90deg,#1d4ed8,#3b82f6)"
                      : "linear-gradient(90deg,#16a34a,#22c55e)",
                },
              }}
            >
               Create Task
            </Button>
          )}
          {extraButton && extraButton}
        </Stack>
      </Stack>

      {/* Task Board */}
      {loading ? (
        <Skeleton variant="rounded" height={300} />
        ) : (
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          sx={{
            mt: 0,
            p: { xs: 1, md: 1.5 },
          }}
        >
          {/* ✅ Force left-to-right flexible layout */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-start", // align from left
              alignItems: "flex-start",
              gap: 2,
              px: { xs: 1, md: 2 },
            }}
          >
            <TaskBoard
              tasks={filtered}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onComment={onComment}
            />
          </Box>
        </Box>
      )}

    </Box>
  );
}