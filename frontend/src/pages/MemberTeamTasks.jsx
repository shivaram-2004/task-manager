import React, { useMemo, useState } from "react";
import SharedDashboardLayout from "../components/SharedDashboardLayout.jsx";
import { useTasks } from "../contexts/TasksContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTeams } from "../contexts/TeamsContext.jsx";
import {
  Box,
  CircularProgress,
  Typography,
  Stack,
  Snackbar,
  Alert,
  Card,
  Paper,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip,
  Divider,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import {
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function MemberTeamTasks() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const { user } = useAuth();
  const { tasks, setTasks, loading } = useTasks();
  const { teams, fetchTeams } = useTeams();

  const [filters, setFilters] = useState({ q: "", status: "", priority: "" });
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showAlert = (message, severity = "success") =>
    setAlert({ open: true, message, severity });

  // ✅ Get all teams the user belongs to
  const myTeams = useMemo(() => {
    if (!Array.isArray(teams) || !user?.email) return [];
    return teams.filter((t) =>
      Array.isArray(t.members)
        ? t.members.some((m) =>
            typeof m === "string"
              ? m === user.email
              : m?.email === user.email
          )
        : false
    );
  }, [teams, user]);

  const teamIds = Array.isArray(myTeams) ? myTeams.map((t) => t.id) : [];

  // ✅ Filter only team tasks
  const teamTasks = useMemo(() => {
    return tasks.filter((t) => t.teamId && teamIds.includes(t.teamId));
  }, [tasks, teamIds]);

  // ✅ Comment handler
  const handleComment = async (taskId, text) => {
    if (!text.trim()) return;
    try {
      const taskRef = doc(db, "tasks", taskId);
      const actorName =
        user?.displayName ||
        user?.name ||
        user?.email?.split("@")[0] ||
        "Unknown User";

      await updateDoc(taskRef, {
        comments: arrayUnion({
          id: Date.now().toString(),
          text,
          authorName: actorName,
          authorEmail: user?.email,
          createdAt: new Date().toISOString(),
        }),
      });

      await addDoc(collection(db, "activityLogs"), {
        action: "Commented on a team task",
        actorName,
        actorEmail: user?.email,
        taskId,
        type: "commented",
        timestamp: Timestamp.now(),
      });

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                comments: [
                  ...(Array.isArray(t.comments) ? t.comments : []),
                  {
                    id: Date.now().toString(),
                    text,
                    authorName: actorName,
                    authorEmail: user?.email,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : t
        )
      );

      showAlert("💬 Comment added successfully!");
    } catch (err) {
      console.error("❌ Error adding comment:", err);
      showAlert("❌ Failed to add comment", "error");
    }
  };

  // ✅ Task status summary
  const taskCounts = useMemo(() => {
    const counts = { todo: 0, inProgress: 0, done: 0 };
    teamTasks.forEach((t) => {
      if (t.status === "To Do") counts.todo++;
      else if (t.status === "In Progress") counts.inProgress++;
      else if (t.status === "Done") counts.done++;
    });
    return counts;
  }, [teamTasks]);

  // ✅ Add “days left”
  const tasksWithDaysLeft = useMemo(() => {
    return teamTasks.map((task) => {
      if (!task.dueDate) return { ...task, daysLeft: null };
      const due = new Date(task.dueDate);
      const today = new Date();
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      return {
        ...task,
        daysLeft:
          diffDays < 0
            ? `Overdue by ${Math.abs(diffDays)} day${
                Math.abs(diffDays) > 1 ? "s" : ""
              }`
            : `${diffDays} day${diffDays !== 1 ? "s" : ""} left`,
      };
    });
  }, [teamTasks]);

  // ✅ Loading
  if (loading) {
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <CircularProgress size={50} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Loading team tasks...
        </Typography>
      </Box>
    );
  }

  // ✅ No tasks
  if (!tasksWithDaysLeft.length) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          textAlign: "center",
          borderRadius: 3,
          background: isDark ? "rgba(255,255,255,0.05)" : "white",
        }}
      >
        <GroupWorkIcon
          sx={{
            fontSize: { xs: 60, md: 80 },
            color: "text.disabled",
            mb: 2,
          }}
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No team tasks found
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Once your team starts assigning tasks, they’ll appear here.
        </Typography>
      </Paper>
    );
  }

  // ✅ Main layout (with TeamPage styling)
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        minHeight: "100vh",
        background: isDark
          ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
          : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          mb: { xs: 3, md: 4 },
          borderRadius: { xs: 2, md: 3 },
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={{ xs: 2, sm: 0 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <GroupWorkIcon sx={{ fontSize: { xs: 30, sm: 36 } }} />
            <Box>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                fontWeight={700}
                sx={{ lineHeight: 1.2 }}
              >
                Team Tasks Overview
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  mt: 0.5,
                  display: { xs: "none", sm: "block" },
                }}
              >
                View all tasks assigned to your teams
              </Typography>
            </Box>
          </Stack>

          <Tooltip title="Refresh Tasks">
            <IconButton
              onClick={fetchTeams}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Summary Cards */}
     

      <Divider sx={{ mb: 3 }} />

      {/* Task Grid */}
      <SharedDashboardLayout
        user={user}
        filters={filters}
        setFilters={setFilters}
        tasks={tasksWithDaysLeft}
        loading={loading}
        onComment={handleComment}
        showCreateButton={false}
      />

      {/* Notifications */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          sx={{
            width: "100%",
            borderRadius: "12px",
            fontWeight: 500,
            color: "#fff",
            background:
              alert.severity === "success"
                ? "linear-gradient(90deg,#22c55e,#4ade80)"
                : "linear-gradient(90deg,#f87171,#ef4444)",
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
