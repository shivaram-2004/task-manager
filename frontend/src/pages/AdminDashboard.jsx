import React from "react";
import {
  Box,
  Paper,
  Typography,
  Snackbar,
  Alert,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import TaskFormDialog from "../components/TaskFormDialog.jsx";
import SharedDashboardLayout from "../components/SharedDashboardLayout.jsx";
import { useTasks } from "../contexts/TasksContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom"; // ✅ added for navigation


export default function AdminDashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { tasks, loading, createTask, updateTask, deleteTask, addComment } =
    useTasks();
  const theme = useTheme();

  const [filters, setFilters] = React.useState({
    q: "",
    status: "",
    priority: "",
  });

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState(null);

  const [alert, setAlert] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
  };

  const handleTaskSubmit = async (values) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, values);
        showAlert(`🔄 Task “${values.title}” updated successfully!`);
      } else {
        await createTask(values);
        const assignee = values.assignedToEmail || "selected user";
        showAlert(`✅ Task “${values.title}” created and assigned to ${assignee}!`);
      }
      setDialogOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error("Task save failed:", err);
      showAlert("❌ Failed to save task.", "error");
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      showAlert("🗑 Task deleted successfully!");
    } catch (err) {
      showAlert("❌ Failed to delete task.", "error");
    }
  };

  // 📊 Analytics
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "Done").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const todo = tasks.filter((t) => t.status === "To Do").length;

  const COLORS = ["#3A5FCD", "#6A8FE7", "#C8D6F7"];
  const chartData = [
    { name: "Done", value: done },
    { name: "In Progress", value: inProgress },
    { name: "To Do", value: todo },
  ];

  return (
    <>
      {/* 🔹 Main Task Layout */}
      <SharedDashboardLayout
        user={user}
        role={role}
        filters={filters}
        setFilters={setFilters}
        tasks={tasks}
        loading={loading}
        onUpdate={handleEditTask}
        onDelete={handleDeleteTask}
        onComment={addComment}
        onNewTask={handleNewTask}
        showCreateButton={true}
        // ✅ Pass Activity Log button here
       
      />



      {/* 🔹 Create/Edit Dialog */}
      <TaskFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingTask(null);
        }}
        defaultValues={
          editingTask || {
            title: "",
            description: "",
            assignedToEmail: "",
            status: "To Do",
            priority: "Medium",
            dueDate: "",
          }
        }
        onSubmit={handleTaskSubmit}
      />

      {/* 🔹 Analytics */}
      {!loading && total > 0 && (
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          sx={{
            mt: 6,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              width: "480px",
              borderRadius: 4,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(30,30,40,0.6)"
                  : "rgba(255,255,255,0.35)",
              backdropFilter: "blur(15px)",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 8px 25px rgba(0,0,0,0.4)"
                  : "0 8px 20px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
          
            
          </Paper>
        </Box>
      )}

      {/* 🔹 Snackbar Notifications */}
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
                ? theme.palette.mode === "dark"
                  ? "linear-gradient(90deg,#2563eb,#60a5fa)"
                  : "linear-gradient(90deg,#22c55e,#4ade80)"
                : theme.palette.mode === "dark"
                ? "linear-gradient(90deg,#f43f5e,#be123c)"
                : "linear-gradient(90deg,#f87171,#ef4444)",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 0 15px rgba(96,165,250,0.5)"
                : "0 0 10px rgba(34,197,94,0.5)",
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
}
