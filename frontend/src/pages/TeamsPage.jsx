import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  Stack,
  CircularProgress,
  IconButton,
  Avatar,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import AddTaskIcon from "@mui/icons-material/AddTask";
import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import { useTeams } from "../contexts/TeamsContext";
import { useAuth } from "../contexts/AuthContext";
import EditTeamDialog from "../components/EditTeamDialog";
import TeamFormDialog from "../components/TeamFormDialog";
import TaskFormDialog from "../components/TaskFormDialog";
import { db } from "../firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useTasks } from "../contexts/TasksContext";

// Utility function to get initials from email
const getInitials = (email) => {
  if (!email) return "?";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Utility function to get color based on email
const getAvatarColor = (email) => {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
    "#6C5CE7", "#A29BFE", "#FD79A8", "#FDCB6E", "#74B9FF"
  ];
  if (!email) return colors[0];
  const index = email.charCodeAt(0) % colors.length;
  return colors[index];
};

export default function TeamsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';
  
  const { user } = useAuth();
  const { teams, createTeam, deleteTeam, fetchTeams, loading } = useTeams();
  const [editingTeam, setEditingTeam] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [taskDialog, setTaskDialog] = useState({ open: false, team: null });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const { tasks, loading: tasksLoading } = useTasks();

  // Create Team
  const handleCreateTeam = async (teamName, members) => {
    if (!teamName.trim() || members.length === 0) {
      alert("Please provide a team name and select members.");
      return;
    }
    await createTeam(teamName, members, user?.email);
  };

  // Open task dialog
  const handleAddTask = (team) => {
    setTaskDialog({ open: true, team });
  };

  // Save new team task
  const handleSubmitTask = async (taskValues) => {
    try {
      await addDoc(collection(db, "tasks"), {
        ...taskValues,
        teamId: taskDialog.team.id,
        assignedToEmails:
          taskValues.assignedToEmails.length > 0
            ? taskValues.assignedToEmails
            : taskDialog.team.members,
        createdBy: user?.email,
        createdAt: serverTimestamp(),
      });
      alert("✅ Task assigned successfully!");
      setTaskDialog({ open: false, team: null });
    } catch (err) {
      console.error("❌ Error adding task:", err);
      alert("❌ Failed to add task");
    }
  };

  return (
    <Box 
      sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        minHeight: "100vh",
        background: isDark 
          ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
          : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: { xs: 2, md: 3 },
          borderRadius: { xs: 2, md: 3 },
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 2 }}>
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
              }}
            >
              <GroupsIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
            </Avatar>
            <Box>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                fontWeight={700}
                sx={{ lineHeight: 1.2 }}
              >
                Teams
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.9, 
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Manage your teams
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton
                onClick={fetchTeams}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              size="small"
              onClick={() => setOpenDialog(true)}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 0.8,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.875rem",
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)",
                },
              }}
            >
              New Team
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Teams Section Header */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
          <Typography 
            variant="subtitle1"
            fontWeight={600} 
            color="text.primary"
          >
            All Teams
          </Typography>
          <Chip
            label={teams.length}
            size="small"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 600,
              height: 20,
            }}
          />
        </Stack>
        <Divider />
      </Box>

      {/* Teams Grid */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={isMobile ? 50 : 60} thickness={4} />
        </Box>
      ) : teams.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            borderRadius: 3,
            background: isDark ? "rgba(255,255,255,0.05)" : "white",
          }}
        >
          <GroupsIcon 
            sx={{ 
              fontSize: { xs: 60, md: 80 }, 
              color: "text.disabled", 
              mb: 2 
            }} 
          />
          <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" gutterBottom>
            No teams found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Create your first team to get started
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {teams.map((team) => {
            const displayMembers = team.members?.slice(0, isMobile ? 3 : 4) || [];
            const remainingCount = (team.members?.length || 0) - (isMobile ? 3 : 4);

            return (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                key={team.id}
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
               <Paper
  onClick={() => setSelectedTeam(team)}
  sx={{
    borderRadius: { xs: 2.5, md: 3 },
    height: 300,               // 🔒 fixed height (same on all screens)
    width: 320,                // 🔒 fixed width (consistent columns)
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    overflow: "hidden",
    position: "relative",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    background: isDark
      ? "linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)"
      : "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
    boxShadow: isDark
      ? "0 4px 20px rgba(0,0,0,0.4)"
      : "0 4px 20px rgba(0,0,0,0.08)",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: isDark
        ? "0 12px 30px rgba(0,0,0,0.6)"
        : "0 12px 30px rgba(0,0,0,0.15)",
      border: `1px solid ${theme.palette.primary.main}`,
    },
  }}
>


                  {/* Top Accent Bar */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: "linear-gradient(90deg, #667eea, #764ba2)",
                    }}
                  />

                  {/* Card Content */}
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      p: 2.5,
                    }}
                  >
                    {/* Header */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mb={1.5}
                      spacing={1}
                      sx={{ minHeight: 48 }}
                    >
                      <Typography
                        variant={isMobile ? "subtitle1" : "h6"}
                        sx={{
                          fontWeight: 700,
                          flex: 1,
                          lineHeight: 1.3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          wordBreak: "break-word",
                          hyphens: "auto",
                        }}
                      >
                        {team.name}
                      </Typography>

                      <Stack direction="row" spacing={0.5} flexShrink={0}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTeam(team);
                            }}
                            sx={{
                              bgcolor: isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)",
                              color: "primary.main",
                              width: 32,
                              height: 32,
                              "&:hover": {
                                bgcolor: isDark ? "rgba(59, 130, 246, 0.25)" : "rgba(59, 130, 246, 0.2)",
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Add Task">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddTask(team);
                            }}
                            sx={{
                              bgcolor: isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)",
                              color: "success.main",
                              width: 32,
                              height: 32,
                              "&:hover": {
                                bgcolor: isDark ? "rgba(16, 185, 129, 0.25)" : "rgba(16, 185, 129, 0.2)",
                              },
                            }}
                          >
                            <AddTaskIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTeam(team.id);
                            }}
                            sx={{
                              bgcolor: isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.1)",
                              color: "error.main",
                              width: 32,
                              height: 32,
                              "&:hover": {
                                bgcolor: isDark ? "rgba(239, 68, 68, 0.25)" : "rgba(239, 68, 68, 0.2)",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    {/* Created By */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        fontSize: "0.85rem",
                      }}
                    >
                      Created by <strong>{team.createdBy?.split("@")[0] || "Unknown"}</strong>
                    </Typography>

                    {/* Member Count */}
                    <Stack spacing={1.5} mb={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                          {team.members?.length || 0} Member{team.members?.length !== 1 ? 's' : ''}
                        </Typography>
                        <Chip
                          label={`${team.members?.length || 0}`}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            bgcolor: "primary.main",
                            color: "white",
                          }}
                        />
                      </Stack>
                    </Stack>

                    <Divider sx={{ mb: 1.5 }} />

                    {/* Assigned Members */}
                    <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                      <GroupsIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Team Members:
                      </Typography>
                    </Stack>

                    {displayMembers.length > 0 ? (
                      <Stack direction="row" spacing={-1} sx={{ mb: 1.5 }}>
                        {displayMembers.map((member, idx) => {
                          const email = typeof member === "string" ? member : member.email || member.name;
                          return (
                            <Tooltip key={idx} title={email} arrow>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: getAvatarColor(email),
                                  border: `2px solid ${isDark ? "#1e1e1e" : "#fff"}`,
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  transition: "transform 0.2s",
                                  "&:hover": {
                                    transform: "scale(1.2)",
                                    zIndex: 10,
                                  },
                                }}
                              >
                                {getInitials(email)}
                              </Avatar>
                            </Tooltip>
                          );
                        })}
                        {remainingCount > 0 && (
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "grey.400",
                              border: `2px solid ${isDark ? "#1e1e1e" : "#fff"}`,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            +{remainingCount}
                          </Avatar>
                        )}
                      </Stack>
                    ) : (
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ mb: 1.5, display: "block" }}
                      >
                        No members assigned
                      </Typography>
                    )}

                    {/* Click to view details */}
                    <Box
                      sx={{
                        mt: "auto",
                        p: 1.5,
                        borderRadius: 2,
                        background: isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.03)",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.8rem",
                          color: "primary.main",
                          fontWeight: 600,
                        }}
                      >
                        Click to view details →
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Team Details Dialog */}
      <Dialog
        open={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            background: isDark
              ? "rgba(30,30,30,0.98)"
              : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }
        }}
      >
        {selectedTeam && (
          <>
            <DialogTitle
              sx={{
                pb: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                    {selectedTeam.name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Created by {selectedTeam.createdBy?.split("@")[0] || "Unknown"}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => setSelectedTeam(null)}
                  sx={{ color: "white" }}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent 
              sx={{ 
                pt: 3,
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
              {/* Team Members Section */}
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Team Members ({selectedTeam.members?.length || 0})
              </Typography>

              <Stack
                spacing={1.5}
                sx={{
                  maxHeight: 300,
                  overflowY: "auto",
                  mb: 3,
                  "&::-webkit-scrollbar": { width: "6px" },
                  "&::-webkit-scrollbar-track": {
                    background: isDark ? "rgba(255,255,255,0.05)" : "#f1f1f1",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: isDark ? "rgba(255,255,255,0.2)" : "#888",
                    borderRadius: "10px",
                  },
                }}
              >
                {selectedTeam.members?.map((member, idx) => {
                  const email = typeof member === "string" ? member : member.email || member.name;
                  return (
                    <Paper
                      key={idx}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: isDark ? "rgba(255,255,255,0.05)" : "#f9fafb",
                        border: "1px solid",
                        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "primary.main",
                          boxShadow: isDark
                            ? "0 2px 8px rgba(102, 126, 234, 0.3)"
                            : "0 2px 8px rgba(102, 126, 234, 0.15)",
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: getAvatarColor(email),
                            fontSize: "0.875rem",
                            fontWeight: 600,
                          }}
                        >
                          {getInitials(email)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {email?.split("@")[0]}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                            }}
                          >
                            {email}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Team Tasks Section */}
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Team Members and Their Tasks
              </Typography>

              {tasksLoading ? (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <Stack spacing={2}>
                  {selectedTeam.members?.map((member, idx) => {
                    const email = typeof member === "string" ? member : member.email || member.name;
                    const memberTasks = tasks.filter(
                      (t) =>
                        t.teamId === selectedTeam.id &&
                        t.assignedToEmails?.includes(email)
                    );

                    return (
                      <Paper
                        key={idx}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: isDark ? "rgba(255,255,255,0.05)" : "#f9fafb",
                          border: "1px solid",
                          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
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
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            color="primary.main"
                          >
                            {email.split("@")[0]}
                          </Typography>
                        </Stack>

                        {memberTasks.length > 0 ? (
                          memberTasks.map((task) => (
                            <Stack
                              key={task.id}
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{
                                py: 1,
                                borderBottom: `1px dashed ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                                "&:last-child": { borderBottom: "none" },
                              }}
                            >
                              <Typography variant="body2">{task.title}</Typography>
                              <Chip
                                label={task.status || "Pending"}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  bgcolor:
                                    task.status === "Done"
                                      ? "success.main"
                                      : task.status === "In Progress"
                                      ? "warning.main"
                                      : isDark
                                      ? "rgba(255,255,255,0.1)"
                                      : "rgba(0,0,0,0.08)",
                                  color:
                                    task.status === "Done" || task.status === "In Progress"
                                      ? "white"
                                      : "text.primary",
                                }}
                              />
                            </Stack>
                          ))
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: "italic", fontSize: "0.85rem" }}
                          >
                            No tasks assigned
                          </Typography>
                        )}
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button
                onClick={() => setSelectedTeam(null)}
                variant="outlined"
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Dialog */}
      {editingTeam && (
        <EditTeamDialog
          open={!!editingTeam}
          onClose={() => setEditingTeam(null)}
          team={editingTeam}
        />
      )}

      {/* Create Dialog */}
      <TeamFormDialog open={openDialog} onClose={() => setOpenDialog(false)} />

      {/* Add Task Dialog */}
      {taskDialog.open && (
        <TaskFormDialog
          open={taskDialog.open}
          onClose={() => setTaskDialog({ open: false, team: null })}
          onSubmit={handleSubmitTask}
          defaultValues={{
            teamId: taskDialog.team?.id || "",
          }}
        />
      )}
    </Box>
  );
}