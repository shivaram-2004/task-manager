import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import TaskCard from "./TaskCard.jsx";
import { useAuth } from "../contexts/AuthContext";
import { logActivity } from "../utils/activityLogger";

export default function TaskBoard({ tasks, onUpdate, onDelete, onComment }) {
  const { user } = useAuth();
  const theme = useTheme();
  const today = new Date();

  // 🔹 Count overdue & completed tasks (optional summary use)
  const dueTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate).setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0) &&
      t.status !== "Done"
  ).length;

  const completedTasks = tasks.filter((t) => t.status === "Done").length;

  // 🔹 Handle updates safely
  const handleUpdate = (idOrTask, maybeChanges) => {
    if (idOrTask && typeof idOrTask === "object" && !maybeChanges) {
      onUpdate?.(idOrTask);
      return;
    }

    const id = idOrTask;
    const changes = maybeChanges || {};
    if (!changes || typeof changes !== "object") return;

    const title = tasks.find((t) => t.id === id)?.title || "Untitled";
    onUpdate?.(id, changes);

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

  // 🔹 Handle comment action
  const handleComment = (taskId, text) => {
    if (!text.trim()) return;
    onComment?.(taskId, text);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1600px",      // optional limit
        mx: "auto",
        py: 4,
        px: { xs: 1, sm: 2, md: 3 },
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        alignItems: "stretch",
        gap: 3,
        color: theme.palette.text.primary,
        transition: "width 0.3s ease, background-color 0.3s ease",
        borderRadius: "18px",
      }}
    >
      {tasks.length === 0 ? (
        <Typography
          variant="body1"
          sx={{
            mt: 5,
            color: theme.palette.text.secondary,
            fontStyle: "italic",
            textAlign: "center",
            width: "100%",
          }}
        >
          No tasks found — try adding one.
        </Typography>
      ) : (
        tasks.map((task, index) => (
          <Box
            key={task.id}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
           sx={{
              flex: {
                xs: "1 1 100%",       // 1 per row (mobile)
                sm: "1 1 calc(50% - 24px)", // 2 per row (tablet)
                md: "1 1 calc(33.33% - 24px)", // 3 per row (small desktop)
                lg: "1 1 calc(25% - 24px)",    // 4 per row (large desktop)
              },
              minWidth: "280px",
              display: "flex",
              justifyContent: "flex-start",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
              },
            }}

          >
            <TaskCard
              task={task}
              onUpdate={handleUpdate}
              onDelete={onDelete}
              onComment={handleComment}
            />
          </Box>
        ))
      )}
    </Box>
  );
}
