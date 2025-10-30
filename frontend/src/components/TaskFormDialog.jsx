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
  Typography,
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

export default function TaskFormDialog({
  open,
  onClose,
  onSubmit,
  defaultValues = {},
}) {
  const { role } = useAuth();

  const [values, setValues] = React.useState({
    title: "",
    description: "",
    assignedToEmails: [],
    status: "To Do",
    priority: "Medium",
    dueDate: "",
  });

  const [isValid, setIsValid] = React.useState(false);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [registeredUsers, setRegisteredUsers] = React.useState([]);

  // 🔹 Fetch all registered users for dropdown
  React.useEffect(() => {
    if (role === "admin") {
      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const snap = await getDocs(collection(db, "users"));
          const userList = snap.docs.map((doc) => doc.data().email);
          setRegisteredUsers(userList);
        } catch (err) {
          console.error("Error fetching users:", err);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [role]);

  // 🔁 Load form data (for editing)
  React.useEffect(() => {
    setValues({
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      assignedToEmails: defaultValues?.assignedToEmails || [],
      status: defaultValues?.status || "To Do",
      priority: defaultValues?.priority || "Medium",
      dueDate: defaultValues?.dueDate || "",
    });
  }, [defaultValues]);

  // 🧩 Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  // 🧩 Handle user multi-select change
  const handleAssignChange = (event) => {
    const {
      target: { value },
    } = event;
    setValues((prev) => ({
      ...prev,
      assignedToEmails: typeof value === "string" ? value.split(",") : value,
    }));
  };

  // ✅ Validate form
  React.useEffect(() => {
    const { title, description, assignedToEmails, dueDate } = values;
    const valid =
      title.trim() &&
      description.trim() &&
      Array.isArray(assignedToEmails) &&
      assignedToEmails.length > 0 &&
      dueDate;
    setIsValid(Boolean(valid));
  }, [values]);

  // 🧾 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    await onSubmit(values);
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

            {/* 👥 Multi-select for registered users */}
            <FormControl fullWidth required>
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
                  {registeredUsers.map((email) => (
                    <MenuItem key={email} value={email}>
                      {email}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </FormControl>

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
                min: new Date().toISOString().split("T")[0], // 🔹 Disables past dates
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
