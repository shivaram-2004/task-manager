import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  useTheme,
  Fade,
  MenuItem,
  Select,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "member",
  });

  const theme = useTheme();
  const usersRef = collection(db, "users");

  // 🔹 Fetch users and exclude admins
  const fetchUsers = async () => {
    const snap = await getDocs(usersRef);
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const filtered = all.filter((u) => u.role?.toLowerCase() !== "admin");
    setUsers(filtered);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Add new user
  const handleAddUser = async () => {
    if (!newUser.email || !newUser.name)
      return alert("Please fill all required fields");
    await addDoc(usersRef, newUser);
    setOpen(false);
    setNewUser({ name: "", email: "", role: "member" });
    fetchUsers();
  };

  // 🔹 Delete user
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteDoc(doc(db, "users", id));
      fetchUsers();
    }
  };

  // 🔹 Update user role inline
  const handleRoleChange = async (id, newRole) => {
    const userDoc = doc(db, "users", id);
    await updateDoc(userDoc, { role: newRole });
    fetchUsers();
  };

  return (
    <Fade in timeout={400}>
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #1e293b, #0f172a)"
              : "linear-gradient(135deg, #f8fafc, #e2e8f0)",
          minHeight: "90vh",
          borderRadius: 3,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h4" fontWeight={700}>
            👥 User Management
          </Typography>
          <Button
            startIcon={<AddCircleIcon />}
            variant="contained"
            onClick={() => setOpen(true)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              py: 1,
              fontWeight: 600,
              boxShadow: "0 4px 10px rgba(59,130,246,0.3)",
            }}
          >
            Add User
          </Button>
        </Stack>

        {/* 🌟 Elegant Table */}
        <Paper
          elevation={5}
          sx={{
            p: 3,
            borderRadius: 3,
            backdropFilter: "blur(6px)",
            background:
              theme.palette.mode === "dark"
                ? "rgba(30,41,59,0.8)"
                : "rgba(255,255,255,0.9)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background:
                    theme.palette.mode === "dark"
                      ? "rgba(59,130,246,0.15)"
                      : "rgba(59,130,246,0.08)",
                }}
              >
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: "center" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No users found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow
                    key={u.id}
                    sx={{
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.03)",
                        transition: "0.2s ease-in-out",
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ bgcolor: "#3b82f6" }}>
                          <PersonIcon />
                        </Avatar>
                        <Typography>{u.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{u.email}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AssignmentIndIcon
                          fontSize="small"
                          color="primary"
                          sx={{ opacity: 0.8 }}
                        />
                        <Select
                          value={u.role || "member"}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value)
                          }
                          size="small"
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            background:
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.05)"
                                : "rgba(0,0,0,0.03)",
                          }}
                        >
                          <MenuItem value="member">Member</MenuItem>
                          <MenuItem value="manager">Manager</MenuItem>
                        </Select>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Delete User">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(u.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* ➕ Add User Dialog */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
              background:
                theme.palette.mode === "dark"
                  ? "rgba(15,23,42,0.95)"
                  : "rgba(255,255,255,0.97)",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 8px 32px rgba(255,255,255,0.1)"
                  : "0 8px 32px rgba(0,0,0,0.1)",
              backdropFilter: "blur(10px)",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ManageAccountsIcon color="primary" /> Add New User
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
              <TextField
                label="Full Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                fullWidth
                required
              />
              <TextField
                label="Email Address"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                fullWidth
                required
              />
              <Select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                fullWidth
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleAddUser}
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Add User
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
