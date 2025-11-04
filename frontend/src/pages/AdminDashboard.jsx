import React from "react";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  useTheme,
  CircularProgress,
} from "@mui/material";
import TaskFormDialog from "../components/TaskFormDialog.jsx";
import FiltersBar from "../components/FiltersBar.jsx";
import TaskBoard from "../components/TaskBoard.jsx";
import { useTasks } from "../contexts/TasksContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function AdminDashboard() {
  const { user, role } = useAuth();
  const {
    tasks,
    setTasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    addComment,
  } = useTasks();

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

  // ✅ Comment handler
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
        action: "Added a comment",
        actorName,
        actorEmail: user?.email,
        taskTitle: title,
        comment: text,
        type: "commented",
        timestamp: Timestamp.now(),
      });

      showAlert("💬 Comment added successfully!");

      if (setTasks) {
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
      }
    } catch (err) {
      console.error("❌ Error adding comment:", err);
      showAlert("❌ Failed to add comment", "error");
    }
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
      console.error("Failed to delete task:", err);
      showAlert("❌ Failed to delete task.", "error");
    }
  };

  // ✅ Filter logic
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      const matchQuery = filters.q
        ? task.title?.toLowerCase().includes(filters.q.toLowerCase()) ||
          task.description?.toLowerCase().includes(filters.q.toLowerCase())
        : true;
      const matchStatus = filters.status ? task.status === filters.status : true;
      const matchPriority = filters.priority ? task.priority === filters.priority : true;
      return matchQuery && matchStatus && matchPriority;
    });
  }, [tasks, filters]);

  if (loading)
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        px: { xs: 2, md: 4 },
        py: 4,
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(180deg,#0a0a0a,#1a1a1a)"
            : "linear-gradient(180deg,#f9fafb,#f3f4f6)",
      }}
    >
      {/* Greeting */}
      <Typography
        variant="h5"
        sx={{
          mb: 2,
          fontWeight: 700,
          color: theme.palette.mode === "dark" ? "#e5e7eb" : "#111827",
        }}
      >
        Good Evening, {user?.name || "Admin"} 👋
      </Typography>

      {/* 🔹 Filter Bar */}
      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        onReset={() => setFilters({ q: "", status: "", priority: "" })}
        onNewTask={handleNewTask}           // ✅ add this
        showCreateButton={role === "admin"} // ✅ only show for admin
      />


      {/* 🔹 Task Grid */}
      <TaskBoard
        tasks={filteredTasks}
        onUpdate={handleEditTask}
        onDelete={handleDeleteTask}
        onComment={handleComment}
      />

      {/* 🔹 Create/Edit Task Form */}
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

      {/* 🔹 Snackbar */}
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
    </Box>
  );
}
