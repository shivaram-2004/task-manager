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
  Collapse,
  Avatar,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import AddTaskIcon from "@mui/icons-material/AddTask";
import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import { useTeams } from "../contexts/TeamsContext";
import { useAuth } from "../contexts/AuthContext";
import EditTeamDialog from "../components/EditTeamDialog";
import TeamFormDialog from "../components/TeamFormDialog";
import TaskFormDialog from "../components/TaskFormDialog";
import { db } from "../firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

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
  const [expandedTeam, setExpandedTeam] = useState(null);

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

  const toggleExpand = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
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
          p: { xs: 2, sm: 2.5, md: 3 },
          mb: { xs: 3, md: 4 },
          borderRadius: { xs: 2, md: 3 },
          background: isDark
            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={{ xs: 2, sm: 0 }}
        >
          <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 2 }}>
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
              }}
            >
              <GroupsIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </Avatar>
            <Box>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                fontWeight={700}
                sx={{ lineHeight: 1.2 }}
              >
                Team Management
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9, 
                  mt: 0.5,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Organize and collaborate with your teams
              </Typography>
            </Box>
          </Stack>
          <Tooltip title="Refresh Teams">
            <IconButton
              onClick={fetchTeams}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                alignSelf: { xs: 'flex-end', sm: 'auto' },
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Create Team Button */}
      <Button
        variant="contained"
        size={isMobile ? "medium" : "large"}
        onClick={() => setOpenDialog(true)}
        startIcon={<GroupsIcon />}
        fullWidth={isMobile}
        sx={{
          mb: { xs: 3, md: 4 },
          borderRadius: 2,
          px: { xs: 3, md: 4 },
          py: { xs: 1.2, md: 1.5 },
          fontWeight: 600,
          textTransform: "none",
          fontSize: { xs: "0.95rem", md: "1rem" },
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
          "&:hover": {
            background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
            boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
          },
        }}
      >
        Create New Team
      </Button>

      {/* Teams Section */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            fontWeight={700} 
            color="text.primary"
          >
            Your Teams
          </Typography>
          <Chip
            label={teams.length}
            size="small"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 600,
            }}
          />
        </Stack>
        <Divider sx={{ mb: 3 }} />
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
            const isExpanded = expandedTeam === team.id;
            const displayMembers = team.members?.slice(0, isMobile ? 3 : 4) || [];
            const remainingCount = (team.members?.length || 0) - (isMobile ? 3 : 4);

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={team.id}>
                <Paper
                  elevation={isExpanded ? 12 : 2}
                  sx={{
                    borderRadius: { xs: 2, md: 3 },
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    transform: isExpanded ? "translateY(-8px)" : "translateY(0)",
                    background: isDark ? "rgba(255,255,255,0.08)" : "white",
                    border: isExpanded 
                      ? "2px solid #667eea" 
                      : isDark 
                        ? "2px solid rgba(255,255,255,0.1)"
                        : "2px solid transparent",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: isDark 
                        ? "0 8px 24px rgba(0,0,0,0.4)"
                        : "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  }}
                  onClick={() => toggleExpand(team.id)}
                >
                  {/* Card Header */}
                  <Box
                    sx={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      p: { xs: 2, md: 2.5 },
                      position: "relative",
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant={isMobile ? "subtitle1" : "h6"}
                          fontWeight={700}
                          color="white"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {team.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ 
                            color: "rgba(255,255,255,0.8)", 
                            mt: 0.5,
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {team.createdBy?.split("@")[0] || "Unknown"}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5} flexShrink={0}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTeam(team);
                            }}
                            sx={{
                              color: "white",
                              bgcolor: "rgba(255,255,255,0.15)",
                              width: { xs: 32, sm: 36 },
                              height: { xs: 32, sm: 36 },
                              "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
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
                              color: "white",
                              bgcolor: "rgba(255,255,255,0.15)",
                              width: { xs: 32, sm: 36 },
                              height: { xs: 32, sm: 36 },
                              "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
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
                              color: "white",
                              bgcolor: "rgba(255,255,255,0.15)",
                              width: { xs: 32, sm: 36 },
                              height: { xs: 32, sm: 36 },
                              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Box>

                  {/* Card Body - Compact View */}
                  <Box sx={{ p: { xs: 2, md: 2.5 } }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        {team.members?.length || 0} Member{team.members?.length !== 1 ? 's' : ''}
                      </Typography>
                    </Stack>

                    {/* Avatar Group */}
                    <Stack direction="row" spacing={-1} sx={{ mb: 1.5 }}>
                      {displayMembers.map((member, idx) => {
                        const email = typeof member === "string" ? member : member.email || member.name;
                        return (
                          <Tooltip key={idx} title={email} arrow>
                            <Avatar
                              sx={{
                                width: { xs: 36, sm: 40 },
                                height: { xs: 36, sm: 40 },
                                bgcolor: getAvatarColor(email),
                                border: isDark ? "2px solid #1a1a2e" : "2px solid white",
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "transform 0.2s",
                                "&:hover": {
                                  transform: "translateY(-4px) scale(1.1)",
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
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 },
                            bgcolor: "grey.400",
                            border: isDark ? "2px solid #1a1a2e" : "2px solid white",
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            fontWeight: 600,
                          }}
                        >
                          +{remainingCount}
                        </Avatar>
                      )}
                    </Stack>

                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{ fontWeight: 600, cursor: "pointer", display: "block" }}
                    >
                      {isExpanded ? "Show less" : "View all members →"}
                    </Typography>
                  </Box>

                  {/* Expanded Section */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box
                      sx={{
                        p: { xs: 2, md: 2.5 },
                        pt: 0,
                        background: isDark 
                          ? "linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.02))"
                          : "linear-gradient(to bottom, #f8f9fa, white)",
                      }}
                    >
                      <Divider sx={{ mb: 2 }} />
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        color="text.primary"
                        mb={2}
                      >
                        All Team Members
                      </Typography>
                      <Stack 
                        spacing={1.5} 
                        sx={{ 
                          maxHeight: { xs: 160, sm: 200 }, 
                          overflowY: "auto",
                          "&::-webkit-scrollbar": {
                            width: "6px",
                          },
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
                        {team.members?.map((member, idx) => {
                          const email = typeof member === "string" ? member : member.email || member.name;
                          return (
                            <Paper
                              key={idx}
                              elevation={0}
                              sx={{
                                p: { xs: 1.2, sm: 1.5 },
                                borderRadius: 2,
                                background: isDark ? "rgba(255,255,255,0.05)" : "white",
                                border: "1px solid",
                                borderColor: isDark ? "rgba(255,255,255,0.1)" : "grey.200",
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
                                    width: { xs: 32, sm: 36 },
                                    height: { xs: 32, sm: 36 },
                                    bgcolor: getAvatarColor(email),
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
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
                                      fontSize: { xs: "0.85rem", sm: "0.875rem" },
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
                                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
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
                      <Box sx={{ textAlign: "center", mt: 2 }}>
                        <Button
                          size="small"
                          startIcon={<CloseIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(team.id);
                          }}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          Close
                        </Button>
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

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