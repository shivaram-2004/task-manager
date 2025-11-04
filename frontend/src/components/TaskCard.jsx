import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Button,
  Chip,
  Avatar,
  Badge,
  useMediaQuery,
  AvatarGroup,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FlagIcon from "@mui/icons-material/Flag";
import PersonIcon from "@mui/icons-material/Person";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PendingIcon from "@mui/icons-material/Pending";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../contexts/AuthContext.jsx";
import Swal from "sweetalert2";

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

const getPriorityColor = (priority, isDark) => {
  const colors = {
    Low: isDark ? "#10b981" : "#059669",
    Medium: isDark ? "#f59e0b" : "#d97706",
    High: isDark ? "#ef4444" : "#dc2626",
  };
  return colors[priority] || colors.Medium;
};

const getStatusIcon = (status) => {
  switch (status) {
    case "Done":
      return <CheckCircleIcon fontSize="small" />;
    case "In Progress":
      return <HourglassEmptyIcon fontSize="small" />;
    default:
      return <PendingIcon fontSize="small" />;
  }
};

export default function TaskCard({ task, onUpdate, onDelete, onComment }) {
  const { user, role } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === "dark";

  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const chatEndRef = useRef(null);

  if (!task || typeof task !== "object") return null;

  const dueDate = task?.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "No Due Date";

  const daysLeft =
    task?.dueDate && !isNaN(new Date(task.dueDate))
      ? Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
      : null;

  const lastComment =
    Array.isArray(task.comments) && task.comments.length > 0
      ? task.comments[task.comments.length - 1]
      : null;

  // Auto-scroll to latest comment when modal opens
  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, task.comments]);

  const handleAddComment = () => {
    if (comment.trim()) {
      onComment?.(task.id, comment.trim());
      setComment("");
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Unified list of assigned users
  const assignedUsers =
    task.assignedTo?.length > 0
      ? task.assignedTo
      : task.assignedToEmails?.map((email) => ({ email, name: email })) || [];

  return (
    <>
      {/* Task Card */}
      <Card
        onClick={() => setOpen(true)}
        sx={{
          borderRadius: { xs: 2.5, md: 3 },
          height: { xs: 'auto', sm: 300 },
          minHeight: { xs: 280, sm: 300 },
          width: "100%",
          maxWidth: { sm: 320 },
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
        {/* Priority Indicator Bar */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${getPriorityColor(task.priority, isDark)}, ${getPriorityColor(task.priority, isDark)}dd)`,
          }}
        />

        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            p: { xs: 2, sm: 2.5 },
            "&:last-child": { pb: { xs: 2, sm: 2.5 } },
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1.5}
            spacing={1}
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
              }}
            >
              {task.title || "Untitled Task"}
            </Typography>

            {role === "admin" && (
              <Stack direction="row" spacing={0.5} flexShrink={0}>
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate?.(task);
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
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      Swal.fire({
                        title: "Delete Task?",
                        text: `"${task.title}" will be permanently deleted.`,
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#ef4444",
                        cancelButtonColor: "#3b82f6",
                        background: isDark ? "rgba(20,20,20,0.95)" : "#fff",
                        color: isDark ? "#f3f4f6" : "#1e1e1e",
                        confirmButtonText: "Delete",
                        cancelButtonText: "Cancel",
                      }).then((result) => {
                        if (result.isConfirmed) {
                          onDelete?.(task.id);
                          Swal.fire({
                            title: "Deleted!",
                            text: "Task has been deleted.",
                            icon: "success",
                            timer: 2000,
                            background: isDark ? "rgba(20,20,20,0.95)" : "#fff",
                            color: isDark ? "#f3f4f6" : "#1e1e1e",
                          });
                        }
                      });
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
            )}
          </Stack>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.5,
              fontSize: { xs: "0.85rem", sm: "0.875rem" },
            }}
          >
            {task.description || "No description provided."}
          </Typography>

          {/* Info Grid */}
          <Stack spacing={1.5} mb={2}>
            {/* Due Date */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <CalendarTodayIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                {dueDate}
              </Typography>
              {daysLeft !== null && (
                <Chip
                  label={
                    daysLeft < 0
                      ? `${Math.abs(daysLeft)}d overdue`
                      : `${daysLeft}d left`
                  }
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    bgcolor:
                      daysLeft < 0
                        ? "error.main"
                        : daysLeft <= 2
                        ? "#f97316"
                        : "success.main",
                    color: "white",
                  }}
                />
              )}
            </Stack>

            {/* Priority */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <FlagIcon
                sx={{
                  fontSize: 16,
                  color: getPriorityColor(task.priority, isDark),
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {task.priority} Priority
              </Typography>
            </Stack>

            {/* Status */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ color: theme.palette.primary.main }}>
                {getStatusIcon(task.status)}
              </Box>
              <Chip
                label={task.status}
                size="small"
                sx={{
                  height: 22,
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
          </Stack>

          <Divider sx={{ mb: 1.5 }} />

          {/* Assigned Users */}
          <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
            <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Assigned To:
            </Typography>
          </Stack>

          {assignedUsers.length > 0 ? (
            <AvatarGroup
              max={4}
              sx={{
                mb: 1.5,
                "& .MuiAvatar-root": {
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  border: `2px solid ${isDark ? "#1e1e1e" : "#fff"}`,
                  fontWeight: 600,
                },
              }}
            >
              {assignedUsers.map((userObj, idx) => {
                const email = userObj.email || userObj.name;
                return (
                  <Tooltip key={idx} title={email} arrow>
                    <Avatar
                      sx={{
                        bgcolor: getAvatarColor(email),
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
            </AvatarGroup>
          ) : (
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ mb: 1.5, display: "block" }}
            >
              No members assigned
            </Typography>
          )}

          {/* Last Comment Preview */}
          {lastComment && (
            <Box
              sx={{
                mt: "auto",
                p: 1.5,
                borderRadius: 2,
                background: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.03)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.75rem", fontWeight: 700, color: "primary.main" }}
                >
                  {lastComment.authorName || "User"}
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.8rem",
                  color: "text.secondary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {lastComment.text}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Chat-Style Modal */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        fullScreen={isMobile}
        maxWidth="sm"
        PaperProps={{
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
        <DialogTitle
          sx={{
            pb: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
              {task.title}
            </Typography>
            <IconButton
              onClick={() => setOpen(false)}
              sx={{ color: "white" }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            maxHeight: isMobile ? "100%" : "60vh",
            overflowY: "auto",
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
          {/* Task Details Section */}
          <Box
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 2,
              background: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.03)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
            }}
          >
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
              {task.description}
            </Typography>

            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarTodayIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="body2">
                  <strong>Due Date:</strong> {dueDate}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <FlagIcon
                  sx={{
                    fontSize: 18,
                    color: getPriorityColor(task.priority, isDark),
                  }}
                />
                <Typography variant="body2">
                  <strong>Priority:</strong> {task.priority}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                {getStatusIcon(task.status)}
                <Typography variant="body2">
                  <strong>Status:</strong> {task.status}
                </Typography>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Assigned Users in Dialog */}
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600 }}>
              👥 Assigned Team Members:
            </Typography>
            {assignedUsers.length > 0 ? (
              <Stack spacing={1}>
                {assignedUsers.map((userObj, idx) => {
                  const email = userObj.email || userObj.name;
                  return (
                    <Stack key={idx} direction="row" alignItems="center" spacing={1.5}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: getAvatarColor(email),
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        {getInitials(email)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {email?.split("@")[0]}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {email}
                        </Typography>
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No members assigned
              </Typography>
            )}
          </Box>

          {/* Comments Section */}
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}
          >
            <ChatBubbleOutlineIcon /> Comments
            <Chip
              label={task.comments?.length || 0}
              size="small"
              sx={{ bgcolor: "primary.main", color: "white" }}
            />
          </Typography>

          {/* Chat Messages */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Array.isArray(task.comments) && task.comments.length > 0 ? (
              task.comments.map((c, i) => {
                const isUser =
                  c.authorEmail === user?.email || c.authorName === user?.displayName;
                const email = c.authorEmail || c.authorName;
                return (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isUser ? "flex-end" : "flex-start",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 0.5 }}
                    >
                      {!isUser && (
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: getAvatarColor(email),
                            fontSize: "0.65rem",
                            fontWeight: 600,
                          }}
                        >
                          {getInitials(email)}
                        </Avatar>
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.75rem",
                        }}
                      >
                        {c.authorName || "Anonymous"} •{" "}
                        {new Date(c.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                      {isUser && (
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: getAvatarColor(email),
                            fontSize: "0.65rem",
                            fontWeight: 600,
                          }}
                        >
                          {getInitials(email)}
                        </Avatar>
                      )}
                    </Stack>
                    <Box
                      sx={{
                        p: 1.5,
                        px: 2,
                        borderRadius: 3,
                        maxWidth: { xs: "85%", sm: "75%" },
                        background: isUser
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : isDark
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(0,0,0,0.05)",
                        color: isUser ? "#fff" : "text.primary",
                        wordBreak: "break-word",
                        boxShadow: isUser
                          ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                          : "none",
                      }}
                    >
                      <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                        {c.text}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  color: "text.secondary",
                }}
              >
                <ChatBubbleOutlineIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography variant="body2">No comments yet. Be the first to comment!</Typography>
              </Box>
            )}
            <div ref={chatEndRef} />
          </Box>
        </DialogContent>

        {/* Comment Input */}
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            background: isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.02)",
            borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
              multiline
              maxRows={3}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleAddComment}
              disabled={!comment.trim()}
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: comment.trim()
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "transparent",
                color: comment.trim() ? "#fff" : "inherit",
                "&:hover": {
                  background: comment.trim()
                    ? "linear-gradient(135deg, #764ba2 0%, #667eea 100%)"
                    : "transparent",
                },
                "&:disabled": {
                  background: "transparent",
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}