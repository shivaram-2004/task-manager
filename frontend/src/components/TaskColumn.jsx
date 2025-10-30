import React from "react";
import TaskCard from "./TaskCard.jsx";
import { Stack, Typography } from "@mui/material";

export default function TaskColumn({ tasks, onUpdate, onDelete, onComment }) {
  // 🧠 Safety check: if tasks is not an array or empty, show message
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return (
      <Typography
        variant="body2"
        sx={{
          textAlign: "center",
          color: "text.secondary",
          mt: 1,
          fontStyle: "italic",
        }}
      >
        No tasks in this section
      </Typography>
    );
  }

  // 🧹 Filter out undefined, null, or invalid task entries
  const validTasks = tasks.filter(
    (t) => t && typeof t === "object" && t.id && t.title
  );

  return (
    <Stack spacing={1.5}>
      {validTasks.length > 0 ? (
        validTasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onComment={onComment}
          />
        ))
      ) : (
        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            color: "text.secondary",
            mt: 1,
            fontStyle: "italic",
          }}
        >
          No valid tasks to display
        </Typography>
      )}
    </Stack>
  );
}
