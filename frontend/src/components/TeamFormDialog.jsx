// src/components/TeamFormDialog.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Box,
  Stack,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTeams } from "../contexts/TeamsContext";
import { useAuth } from "../contexts/AuthContext";
import TaskFormDialog from "./TaskFormDialog";

export default function TeamFormDialog({ open, onClose }) {
  const { users, createTeam } = useTeams();
  const { user } = useAuth();

  const [teamName, setTeamName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Manage embedded TaskFormDialog
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  // ✅ Add a new task from TaskFormDialog
  const handleAddTask = (newTask) => {
    setTasks((prev) => [...prev, { ...newTask }]);
    setTaskDialogOpen(false);
  };

  // 🗑 Remove a task before saving
  const handleRemoveTask = (index) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Submit the new team
  const handleSubmit = async () => {
    if (!teamName.trim() || selectedMembers.length === 0) {
      alert("Please enter a team name and select members.");
      return;
    }

    await createTeam(teamName.trim(), selectedMembers, user?.email, tasks);
    setTeamName("");
    setSelectedMembers([]);
    setTasks([]);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          component: motion.div,
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.25 },
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.3rem" }}>
          Create New Team
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {/* 🏷 Team Name */}
            <TextField
              label="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              fullWidth
            />

            {/* 👥 Select Members */}
            <FormControl fullWidth>
              <InputLabel>Select Team Members</InputLabel>
              <Select
                multiple
                value={selectedMembers}
                onChange={(e) => setSelectedMembers(e.target.value)}
                input={<OutlinedInput label="Select Team Members" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((email) => (
                      <Chip key={email} label={email} color="info" />
                    ))}
                  </Box>
                )}
              >
                {users && users.length > 0 ? (
                  users.map((u) => (
                    <MenuItem key={u.email} value={u.email}>
                      {u.name ? `${u.name} (${u.email})` : u.email}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No registered users</MenuItem>
                )}
              </Select>
            </FormControl>

            {/* 🧾 Task List Section */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Team Tasks
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setTaskDialogOpen(true)}
              >
                Add Task
              </Button>
            </Stack>

            {tasks.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                No tasks added yet.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {tasks.map((task, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 1.2,
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: 2,
                      background: "rgba(255,255,255,0.6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography fontWeight={600}>{task.title}</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.3 }}
                      >
                        Priority: {task.priority} • Due:{" "}
                        {new Date(task.dueDate).toLocaleDateString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        Assigned to:{" "}
                        {task.assignedToEmails?.length
                          ? task.assignedToEmails.join(", ")
                          : "All Team Members"}
                      </Typography>
                    </Box>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleRemoveTask(i)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Create Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🧩 Embedded Task Creation Dialog */}
      <TaskFormDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        onSubmit={handleAddTask}
      />
    </>
  );
}
