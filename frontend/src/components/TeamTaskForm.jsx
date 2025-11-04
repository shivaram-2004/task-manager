// src/components/TeamTaskForm.jsx
import React from "react";
import {
  Box,
  TextField,
  Stack,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";

export default function TeamTaskForm({ onAdd }) {
  const [task, setTask] = React.useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    if (!task.title || !task.description || !task.dueDate)
      return alert("Please fill all fields");
    onAdd(task);
    setTask({ title: "", description: "", priority: "Medium", dueDate: "" });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Add Team Task
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Task Title"
          name="title"
          value={task.title}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Description"
          name="description"
          value={task.description}
          onChange={handleChange}
          multiline
          rows={2}
          fullWidth
        />
        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Priority"
            name="priority"
            value={task.priority}
            onChange={handleChange}
            fullWidth
          >
            {["Low", "Medium", "High"].map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Due Date"
            name="dueDate"
            type="date"
            value={task.dueDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().split("T")[0] }}
            fullWidth
          />
        </Stack>
        <Button
                variant="outlined"
                color="primary"
                onClick={() => setTaskDialogOpen(true)}
                >
                ➕ Add Task
                </Button>

                <TaskFormDialog
                open={taskDialogOpen}
                onClose={() => setTaskDialogOpen(false)}
                onSubmit={(task) => {
                    setTasks((prev) => [...prev, { ...task, teamId: null }]);
                    setTaskDialogOpen(false);
                }}
                />
      </Stack>
    </Box>
  );
}
