import React from "react";
import SharedDashboardLayout from "../components/SharedDashboardLayout.jsx";
import { useTasks } from "../contexts/TasksContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  Box,
  CircularProgress,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
} from "@mui/material";

export default function MemberDashboard() {
  const { user } = useAuth();
  const { tasks, loading, addComment } = useTasks();

  const [filters, setFilters] = React.useState({
    q: "",
    status: "",
    priority: "",
  });

  // 🔹 Filtered tasks for the logged-in member
  const assignedTasks = React.useMemo(() => {
    return tasks.filter(
      (t) => t.assignedToEmail?.toLowerCase() === user?.email?.toLowerCase()
    );
  }, [tasks, user]);

  // 🔹 Compute task status counts
  const taskCounts = React.useMemo(() => {
    const counts = { todo: 0, inProgress: 0, done: 0 };
    assignedTasks.forEach((t) => {
      if (t.status === "To Do") counts.todo++;
      else if (t.status === "In Progress") counts.inProgress++;
      else if (t.status === "Done") counts.done++;
    });
    return counts;
  }, [assignedTasks]);

  // 🔹 Add "days left" for each task
  const tasksWithDaysLeft = React.useMemo(() => {
    return assignedTasks.map((task) => {
      if (!task.dueDate) return { ...task, daysLeft: null };
      const due = new Date(task.dueDate);
      const today = new Date();
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...task,
        daysLeft:
          diffDays < 0
            ? `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""}`
            : `${diffDays} day${diffDays !== 1 ? "s" : ""} left`,
      };
    });
  }, [assignedTasks]);

  // 🔹 Loading State
  if (loading) {
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
        }}
      >
        <CircularProgress size={50} sx={{ mb: 2 }} />
        <Typography variant="h6">Fetching your tasks...</Typography>
      </Box>
    );
  }

  // 🔹 No Tasks Assigned
  if (!assignedTasks.length) {
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="h5" sx={{ mb: 1 }}>
          🌤 No Tasks Assigned
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You currently don’t have any active tasks.
          Your dashboard will update automatically when an admin assigns one to you.
        </Typography>
      </Box>
    );
  }

  // 🔹 Main Layout with Inline Summary beside Filter Bar
  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        {/* 🧩 Shared Layout Filter Bar */}

        {/* 🔸 Inline Summary Bar */}
        <Stack direction="row" spacing={2}>
          <Card
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1,
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(147,197,253,0.3))",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              To Do
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {taskCounts.todo}
            </Typography>
          </Card>

          <Card
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1,
              background:
                "linear-gradient(135deg, rgba(234,179,8,0.1), rgba(253,224,71,0.3))",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              In Progress
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {taskCounts.inProgress}
            </Typography>
          </Card>

          <Card
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1,
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(134,239,172,0.3))",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Done
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {taskCounts.done}
            </Typography>
          </Card>
        </Stack>
      </Stack>

      {/* 🧩 Shared Layout with Tasks */}
      <SharedDashboardLayout
        user={user}
        filters={filters}
        setFilters={setFilters}
        tasks={tasksWithDaysLeft} // pass updated tasks
        loading={loading}
        onUpdate={() => {}}
        onDelete={() => {}}
        onComment={addComment}
        showCreateButton={false}
      />
    </Box>
  );
}
