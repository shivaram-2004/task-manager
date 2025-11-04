import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Chip,
  CircularProgress,
  Box,
} from "@mui/material";
import { motion } from "framer-motion";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTeams } from "../contexts/TeamsContext.jsx";

export default function TaskFormDialog({
  open,
  onClose,
  onSubmit,
  defaultValues = {},
}) {
  const { role } = useAuth();
  const { teams } = useTeams();

  // ✅ Stable initial state
  const initialFormState = {
    title: "",
    description: "",
    assignedToEmails: [],
    status: "To Do",
    priority: "Medium",
    dueDate: "",
    teamId: "",
  };

  const [values, setValues] = React.useState(initialFormState);
  const [isValid, setIsValid] = React.useState(false);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [registeredUsers, setRegisteredUsers] = React.useState([]);

  // 🔹 Fetch users only once when mounted
  React.useEffect(() => {
    let active = true;
    const fetchUsers = async () => {
      if (role !== "admin") return;
      try {
        setLoadingUsers(true);
        const snap = await getDocs(collection(db, "users"));
        const userList = snap.docs.map((doc) => doc.data().email);
        if (active) setRegisteredUsers(userList);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        if (active) setLoadingUsers(false);
      }
    };
    fetchUsers();
    return () => {
      active = false;
    };
  }, []); // ✅ only once

  // 🔁 Sync default values when dialog opens or edit mode
  React.useEffect(() => {
    if (!open) return; // only run when dialog is open
    if (!defaultValues || Object.keys(defaultValues).length === 0) {
      setValues(initialFormState); // reset for new task
    } else {
      // only update if changed
      setValues((prev) => {
        const changed = Object.keys(defaultValues).some(
          (k) => defaultValues[k] !== prev[k]
        );
        return changed ? { ...prev, ...defaultValues } : prev;
      });
    }
  }, [open, defaultValues]); // ✅ only when opening or switching edit mode

  // 🧩 Field change handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignChange = (event) => {
    const {
      target: { value },
    } = event;
    setValues((prev) => ({
      ...prev,
      assignedToEmails: typeof value === "string" ? value.split(",") : value,
    }));
  };

  // ✅ Form validation
  React.useEffect(() => {
    const { title, description, dueDate } = values;
    const valid = Boolean(title.trim() && description.trim() && dueDate);
    if (isValid !== valid) setIsValid(valid);
  }, [values, isValid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    // Fetch full user info (name + email)
    const usersSnap = await getDocs(collection(db, "users"));
    const userData = usersSnap.docs.map((doc) => doc.data());

    const enrichedAssignees = values.assignedToEmails.map((email) => {
      const userInfo = userData.find((u) => u.email === email);
      return {
        email,
        name: userInfo?.name || email.split("@")[0],
      };
    });

    const updatedValues = {
      ...values,
      assignedTo: enrichedAssignees, // ✅ New field
    };

    await onSubmit(updatedValues);
  };


  return (
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
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
        {defaultValues?.id ? "Edit Task" : "Create Task"}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Title"
              name="title"
              value={values.title}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Description"
              name="description"
              value={values.description}
              onChange={handleChange}
              multiline
              rows={3}
              required
              fullWidth
            />

            {/* ✅ Team Selection */}
            {role === "admin" && (
              <FormControl fullWidth>
                <InputLabel id="team-select-label">Team</InputLabel>
                <Select
                  labelId="team-select-label"
                  name="teamId"
                  value={values.teamId || ""}
                  onChange={handleChange}
                  input={<OutlinedInput label="Team" />}
                >
                  <MenuItem value="">None</MenuItem>
                  {teams.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* 👥 Assign Users */}
            <FormControl fullWidth>
              <InputLabel id="assign-users-label">Assign To Users</InputLabel>
              {loadingUsers ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Select
                  labelId="assign-users-label"
                  multiple
                  name="assignedToEmails"
                  value={values.assignedToEmails}
                  onChange={handleAssignChange}
                  input={<OutlinedInput label="Assign To Users" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((email) => (
                        <Chip key={email} label={email} color="info" />
                      ))}
                    </Box>
                  )}
                >
                  {registeredUsers.length > 0 ? (
                    registeredUsers.map((email) => (
                      <MenuItem key={email} value={email}>
                        {email}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No registered users</MenuItem>
                  )}
                </Select>
              )}
            </FormControl>

            {/* 🔸 Status + Priority */}
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Status"
                name="status"
                value={values.status}
                onChange={handleChange}
                fullWidth
              >
                {["To Do", "In Progress", "Done"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Priority"
                name="priority"
                value={values.priority}
                onChange={handleChange}
                fullWidth
              >
                {["Low", "Medium", "High"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* 🗓 Due Date */}
            <TextField
              label="Due Date"
              name="dueDate"
              type="date"
              value={values.dueDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
              inputProps={{
                min: new Date().toISOString().split("T")[0],
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            {defaultValues?.id ? "Save Changes" : "Create Task"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
