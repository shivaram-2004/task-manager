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
  Typography,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddTaskIcon from "@mui/icons-material/AddTask";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FlagIcon from "@mui/icons-material/Flag";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import { motion } from "framer-motion";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTeams } from "../contexts/TeamsContext.jsx";

// Utility functions
const getInitials = (email) => {
  if (!email) return "?";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (email) => {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
    "#6C5CE7", "#A29BFE", "#FD79A8", "#FDCB6E", "#74B9FF"
  ];
  if (!email) return colors[0];
  const index = email.charCodeAt(0) % colors.length;
  return colors[index];
};

export default function TaskFormDialog({
  open,
  onClose,
  onSubmit,
  defaultValues = {},
}) {
  const { role } = useAuth();
  const { teams } = useTeams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === "dark";

  // Stable initial state
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

  // Fetch users only once when mounted
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
  }, []);

  React.useEffect(() => {
    if (!open) return;
    if (!defaultValues || Object.keys(defaultValues).length === 0) {
      setValues(initialFormState);
    } else {
      setValues((prev) => {
        const changed = Object.keys(defaultValues).some(
          (k) => defaultValues[k] !== prev[k]
        );
        return changed ? { ...prev, ...defaultValues } : prev;
      });
    }
  }, [open, defaultValues]);

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

  React.useEffect(() => {
    const { title, description, dueDate } = values;
    const valid = Boolean(title.trim() && description.trim() && dueDate);
    if (isValid !== valid) setIsValid(valid);
  }, [values, isValid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

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
      assignedTo: enrichedAssignees,
    };

    await onSubmit(updatedValues);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: "#10b981",
      Medium: "#f59e0b",
      High: "#ef4444",
    };
    return colors[priority] || colors.Medium;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.25 },
        sx: {
          borderRadius: isMobile ? 0 : 3,
          background: isDark
            ? "rgba(30,30,30,0.98)"
            : "rgba(255,255,255,0.98)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          pb: 2,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                width: 40,
                height: 40,
              }}
            >
              <AddTaskIcon />
            </Avatar>
            <Box>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                {defaultValues?.id ? "Edit Task" : "Create New Task"}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {defaultValues?.id ? "Update task details" : "Fill in the details below"}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={onClose}
            sx={{ color: "white" }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent
          dividers
          sx={{
            p: { xs: 2, sm: 3 },
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: isDark ? "rgba(255,255,255,0.05)" : "#f1f1f1",
            },
            "&::-webkit-scrollbar-thumb": {
              background: isDark ? "rgba(255,255,255,0.2)" : "#888",
              borderRadius: "4px",
            },
          }}
        >
          <Stack spacing={3}>
            {/* Task Title */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <DescriptionIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Task Title *
                </Typography>
              </Stack>
              <TextField
                name="title"
                placeholder="Enter task title..."
                value={values.title}
                onChange={handleChange}
                required
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <DescriptionIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Description *
                </Typography>
              </Stack>
              <TextField
                name="description"
                placeholder="Describe the task in detail..."
                value={values.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            <Divider />

            {role === "admin" && (
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <GroupsIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Assign to Team
                  </Typography>
                </Stack>
                <FormControl fullWidth>
                  <Select
                    name="teamId"
                    value={values.teamId || ""}
                    onChange={handleChange}
                    displayEmpty
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="">
                      <em>No team selected</em>
                    </MenuItem>
                    {teams.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <GroupsIcon fontSize="small" color="primary" />
                          <span>{t.name}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <PersonIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Assign to Users
                </Typography>
              </Stack>
              <FormControl fullWidth>
                {loadingUsers ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background: isDark ? "rgba(255,255,255,0.05)" : "#f9fafb",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size={24} />
                  </Paper>
                ) : (
                  <Select
                    multiple
                    name="assignedToEmails"
                    value={values.assignedToEmails}
                    onChange={handleAssignChange}
                    displayEmpty
                    sx={{
                      borderRadius: 2,
                    }}
                    renderValue={(selected) =>
                      selected.length === 0 ? (
                        <em style={{ color: theme.palette.text.secondary }}>
                          Select team members
                        </em>
                      ) : (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((email) => (
                            <Chip
                              key={email}
                              avatar={
                                <Avatar
                                  sx={{
                                    bgcolor: getAvatarColor(email),
                                    width: 24,
                                    height: 24,
                                    fontSize: "0.65rem",
                                  }}
                                >
                                  {getInitials(email)}
                                </Avatar>
                              }
                              label={email.split("@")[0]}
                              size="small"
                              sx={{
                                bgcolor: isDark
                                  ? "rgba(255,255,255,0.1)"
                                  : "rgba(0,0,0,0.08)",
                              }}
                            />
                          ))}
                        </Box>
                      )
                    }
                  >
                    {registeredUsers.length > 0 ? (
                      registeredUsers.map((email) => (
                        <MenuItem key={email} value={email}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: getAvatarColor(email),
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}
                            >
                              {getInitials(email)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {email.split("@")[0]}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {email}
                              </Typography>
                            </Box>
                          </Stack>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        <em>No registered users</em>
                      </MenuItem>
                    )}
                  </Select>
                )}
              </FormControl>
            </Box>

            <Divider />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                    }}
                  />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Status *
                  </Typography>
                </Stack>
                <TextField
                  select
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                >
                  {["To Do", "In Progress", "Done"].map((option) => (
                    <MenuItem key={option} value={option}>
                      <Chip
                        label={option}
                        size="small"
                        sx={{
                          bgcolor:
                            option === "Done"
                              ? "success.main"
                              : option === "In Progress"
                              ? "warning.main"
                              : isDark
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.08)",
                          color:
                            option === "Done" || option === "In Progress"
                              ? "white"
                              : "text.primary",
                          fontWeight: 600,
                        }}
                      />
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <FlagIcon
                    sx={{
                      fontSize: 20,
                      color: getPriorityColor(values.priority),
                    }}
                  />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Priority *
                  </Typography>
                </Stack>
                <TextField
                  select
                  name="priority"
                  value={values.priority}
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                >
                  {["Low", "Medium", "High"].map((option) => (
                    <MenuItem key={option} value={option}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FlagIcon
                          sx={{
                            fontSize: 18,
                            color: getPriorityColor(option),
                          }}
                        />
                        <span>{option}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Stack>

            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <CalendarTodayIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Due Date *
                </Typography>
              </Stack>
              <TextField
                name="dueDate"
                type="date"
                value={values.dueDate}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().split("T")[0],
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            background: isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.02)",
            borderTop: `1px solid ${
              isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
            }`,
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid}
            sx={{
              borderRadius: 2,
              px: 4,
              fontWeight: 600,
              textTransform: "none",
              background: isValid
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : undefined,
              "&:hover": {
                background: isValid
                  ? "linear-gradient(135deg, #764ba2 0%, #667eea 100%)"
                  : undefined,
              },
            }}
          >
            {defaultValues?.id ? "Save Changes" : "Create Task"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}