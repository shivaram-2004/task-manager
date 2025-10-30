import React from "react";
import { Box, Typography, Paper, Stack, useTheme, Grid } from "@mui/material";
import { motion } from "framer-motion";
import TaskCard from "./TaskCard.jsx";
import { useAuth } from "../contexts/AuthContext";
import { logActivity } from "../utils/activityLogger";

export default function TaskBoard({ tasks, onUpdate, onDelete, onComment }) {
  const { user } = useAuth();
  const theme = useTheme();
  const today = new Date();

  const dueTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate).setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0) &&
      t.status !== "Done"
  ).length;

  const completedTasks = tasks.filter((t) => t.status === "Done").length;

  // 🧠 Handle updates safely (both direct + dialog)
  const handleUpdate = (idOrTask, maybeChanges) => {
    // Case 1: Editing via dialog → idOrTask is full task object
    if (idOrTask && typeof idOrTask === "object" && !maybeChanges) {
      onUpdate?.(idOrTask);
      return;
    }

    // Case 2: Inline update (status change)
    const id = idOrTask;
    const changes = maybeChanges || {};
    if (!changes || typeof changes !== "object") return;

    const title = tasks.find((t) => t.id === id)?.title || "Untitled";
    onUpdate?.(id, changes);

    // Optional: log update details
    const keys = Object.keys(changes);
    if (keys.length > 0) {
      logActivity(
        user?.name || "Unknown User",
        `updated ${keys.join(", ")}`,
        title,
        changes.status === "Done" ? "completed" : "updated"
      );
    }
  };

  const handleComment = (taskId, text) => {
    onComment?.(taskId, text);
    const title = tasks.find((t) => t.id === taskId)?.title || "Untitled Task";
    logActivity(user?.name || "Unknown User", "commented on", title, "commented");
  };

  const handleDelete = (taskId) => {
  onDelete?.(taskId); // ✅ pass ID upward
  const title = tasks.find((t) => t.id === taskId)?.title || "Untitled Task";
  logActivity(user?.name || "Unknown User", "deleted", title, "deleted");
  };


  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1600px",
        mx: "auto",
        py: 4,
        px: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
      }}
    >
      

      {/* 🎨 Freestyle Task Grid (No Columns) */}
      {tasks.length === 0 ? (
        <Typography
          variant="body1"
          sx={{
            mt: 5,
            color: theme.palette.text.secondary,
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          No tasks found — try adding one.
        </Typography>
      ) : (
        <Grid
          container
          spacing={3}
          justifyContent="flex-start"
          alignItems="stretch"
          sx={{ mt: 2 }}
        >
          {tasks.map((task, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={task.id}
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Paper
                elevation={theme.palette.mode === "dark" ? 3 : 4}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  height: "100%",
                  background:
                    theme.palette.mode === "dark"
                      ? "rgba(20,20,20,0.9)"
                      : "#ffffff",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 6px 20px rgba(0,0,0,0.6)"
                      : "0 6px 20px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 8px 25px rgba(0,0,0,0.8)"
                        : "0 8px 25px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <TaskCard
                  task={task}
                  onUpdate={handleUpdate}
                  onDelete={() => handleDelete(task.id)}
                  onComment={handleComment}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
