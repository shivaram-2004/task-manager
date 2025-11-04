import React from "react";
import SharedDashboardLayout from "../components/SharedDashboardLayout.jsx";
import { useTasks } from "../contexts/TasksContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTeams } from "../contexts/TeamsContext.jsx";
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  Stack,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Container,
  Fade,
  Paper,
  LinearProgress,
  Chip,
  Avatar,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import {
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

// Status Card Component
const StatusCard = ({ label, count, color, icon: Icon, isDark, progress }) => (
  <Card
    sx={{
      borderRadius: { xs: 2.5, md: 3 },
      flex: 1,
      minWidth: { xs: "100%", sm: 140 },
      position: "relative",
      overflow: "hidden",
      background: isDark
        ? `linear-gradient(145deg, ${color}15 0%, ${color}25 100%)`
        : `linear-gradient(145deg, ${color}10 0%, ${color}20 100%)`,
      border: `1px solid ${isDark ? `${color}30` : `${color}25`}`,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: isDark
        ? "0 4px 16px rgba(0,0,0,0.4)"
        : "0 4px 16px rgba(0,0,0,0.08)",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: isDark
          ? `0 8px 24px ${color}30`
          : `0 8px 24px ${color}25`,
        border: `1px solid ${color}`,
      },
    }}
  >
    {/* Background decoration */}
    <Box
      sx={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        opacity: 0.5,
      }}
    />
    
    <Box sx={{ p: { xs: 2, sm: 2.5 }, position: "relative", zIndex: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color,
              mt: 0.5,
              fontSize: { xs: "1.75rem", sm: "2rem" },
              lineHeight: 1,
            }}
          >
            {count}
          </Typography>
        </Box>
        <Box
          sx={{
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${color}20`,
          }}
        >
          <Icon sx={{ color, fontSize: { xs: 22, sm: 24 } }} />
        </Box>
      </Stack>
      
      {progress !== undefined && (
        <Box sx={{ mt: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              Progress
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color, fontSize: "0.7rem" }}>
              {progress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              "& .MuiLinearProgress-bar": {
                background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
                borderRadius: 3,
              },
            }}
          />
        </Box>
      )}
    </Box>
  </Card>
);

export default function MemberDashboard() {
  const { user } = useAuth();
  const { tasks, setTasks, loading } = useTasks();
  const { teams } = useTeams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const [filters, setFilters] = React.useState({
    q: "",
    status: "",
    priority: "",
  });

  const [alert, setAlert] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showAlert = (message, severity = "success") =>
    setAlert({ open: true, message, severity });

  // 🟢 Handle adding a comment
  const handleComment = async (taskId, text) => {
    if (!text.trim()) return;

    try {
      const taskRef = doc(db, "tasks", taskId);
      const task = tasks.find((t) => t.id === taskId);
      const title = task?.title || "Untitled Task";
      const actorName =
        user?.displayName ||
        user?.name ||
        user?.email?.split("@")[0] ||
        "Unknown User";

      // 1️⃣ Add comment to Firestore
      await updateDoc(taskRef, {
        comments: arrayUnion({
          id: Date.now().toString(),
          text,
          authorName: actorName,
          authorEmail: user?.email,
          createdAt: new Date().toISOString(),
        }),
      });

      // 2️⃣ Add to activity logs
      await addDoc(collection(db, "activityLogs"), {
        action: "Added a comment",
        actorName,
        actorEmail: user?.email,
        taskTitle: title,
        comment: text,
        type: "commented",
        timestamp: Timestamp.now(),
      });

      // 3️⃣ Local update for instant feedback
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

  // 🔹 Get teams this user belongs to
  const myTeams = React.useMemo(
    () => teams.filter((t) => Array.isArray(t.members) && t.members.includes(user.email)),
    [teams, user]
  );
  const teamIds = myTeams.map((t) => t.id);

  // 🔹 Merge personal + team tasks
  const visibleTasks = React.useMemo(() => {
    return tasks.filter(
      (t) =>
        (Array.isArray(t.assignedToEmails) &&
          t.assignedToEmails.includes(user.email)) ||
        (t.teamId && teamIds.includes(t.teamId))
    );
  }, [tasks, teamIds, user]);

  // 🔹 Compute status counts
  const taskCounts = React.useMemo(() => {
    const counts = { todo: 0, inProgress: 0, done: 0 };
    visibleTasks.forEach((t) => {
      if (t.status === "To Do") counts.todo++;
      else if (t.status === "In Progress") counts.inProgress++;
      else if (t.status === "Done") counts.done++;
    });
    return counts;
  }, [visibleTasks]);

  // 🔹 Calculate completion percentage
  const completionRate = React.useMemo(() => {
    const total = visibleTasks.length;
    if (total === 0) return 0;
    return Math.round((taskCounts.done / total) * 100);
  }, [visibleTasks, taskCounts]);

  // 🔹 Add "days left" info
  const tasksWithDaysLeft = React.useMemo(() => {
    return visibleTasks.map((task) => {
      if (!task.dueDate) return { ...task, daysLeft: null };
      const due = new Date(task.dueDate);
      const today = new Date();
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      return {
        ...task,
        daysLeft:
          diffDays < 0
            ? `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""}`
            : `${diffDays} day${diffDays !== 1 ? "s" : ""} left`,
      };
    });
  }, [visibleTasks]);

  // 🔹 Loading state
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: isDark
            ? "linear-gradient(145deg, #0f0f0f 0%, #1a1a1a 100%)"
            : "linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)",
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            mb: 3,
            color: "primary.main",
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 600, color: "text.secondary" }}>
          Loading your dashboard...
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
          Please wait while we fetch your tasks
        </Typography>
      </Box>
    );
  }

  // 🔹 Empty state
  if (!tasksWithDaysLeft.length) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 3,
          background: isDark
            ? "linear-gradient(145deg, #0f0f0f 0%, #1a1a1a 100%)"
            : "linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)",
        }}
      >
        <Box
          sx={{
            width: { xs: 120, sm: 160 },
            height: { xs: 120, sm: 160 },
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isDark
              ? "linear-gradient(145deg, #1e1e1e, #2d2d2d)"
              : "linear-gradient(145deg, #ffffff, #f0f0f0)",
            boxShadow: isDark
              ? "0 8px 32px rgba(0,0,0,0.6)"
              : "0 8px 32px rgba(0,0,0,0.1)",
            mb: 3,
          }}
        >
          <AssignmentIcon
            sx={{
              fontSize: { xs: 60, sm: 80 },
              color: "primary.main",
              opacity: 0.7,
            }}
          />
        </Box>
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            fontWeight: 700,
            fontSize: { xs: "1.75rem", sm: "2rem" },
          }}
        >
          No Tasks Yet
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: 500,
            lineHeight: 1.7,
            fontSize: { xs: "0.95rem", sm: "1rem" },
          }}
        >
          You don't have any assigned or team tasks at the moment.
          <br />
          Your dashboard will update automatically when new tasks are available.
        </Typography>
      </Box>
    );
  }

  // 🔹 Main dashboard layout
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: isDark
          ? "linear-gradient(145deg, #0f0f0f 0%, #1a1a1a 100%)"
          : "linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)",
        pb: 4,
      }}
    >
      <Container maxWidth="xl" sx={{ pt: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Section */}
        
        {/* Status Summary Cards 
        <Fade in timeout={800}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: { xs: 3, md: 4 } }}
          >
            <StatusCard
              label="To Do"
              count={taskCounts.todo}
              color="#3b82f6"
              icon={PendingIcon}
              isDark={isDark}
            />
            <StatusCard
              label="In Progress"
              count={taskCounts.inProgress}
              color="#eab308"
              icon={HourglassEmptyIcon}
              isDark={isDark}
              progress={taskCounts.inProgress > 0 ? 50 : 0}
            />
            <StatusCard
              label="Completed"
              count={taskCounts.done}
              color="#22c55e"
              icon={CheckCircleIcon}
              isDark={isDark}
              progress={completionRate}
            />
          </Stack>
        </Fade>*/}

        {/* Task Cards Section */}
        <Fade in timeout={1000}>
          <Box>
            <Typography
              variant="h5"
              sx={{
                mb: 2.5,
                fontWeight: 700,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              Your Tasks
              <Chip
                label={tasksWithDaysLeft.length}
                size="small"
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  fontWeight: 700,
                  height: 24,
                }}
              />
            </Typography>
            
            <SharedDashboardLayout
              user={user}
              filters={filters}
              setFilters={setFilters}
              tasks={tasksWithDaysLeft}
              loading={loading}
              onUpdate={() => {}}
              onDelete={() => {}}
              onComment={handleComment}
              showCreateButton={false}
            />
          </Box>
        </Fade>
      </Container>

      {/* Alert Snackbar */}
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
            fontWeight: 600,
            fontSize: { xs: "0.875rem", sm: "0.95rem" },
            color: "#fff",
            background:
              alert.severity === "success"
                ? "linear-gradient(135deg, #22c55e 0%, #4ade80 100%)"
                : "linear-gradient(135deg, #f87171 0%, #ef4444 100%)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}