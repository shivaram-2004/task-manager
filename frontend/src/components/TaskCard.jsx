import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  TextField,
  Button,
  Tooltip,
  Divider,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  keyframes,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CommentIcon from "@mui/icons-material/Comment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { useAuth } from "../contexts/AuthContext.jsx";

// 🔄 Define shake animation for overdue tasks
const shakeAnimation = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  50% { transform: translateX(3px); }
  75% { transform: translateX(-3px); }
  100% { transform: translateX(0); }
`;

export default function TaskCard({ task, onUpdate, onDelete, onComment }) {
  const { role } = useAuth();
  const theme = useTheme();

  if (!task || typeof task !== "object") return null;

  const [isCommenting, setIsCommenting] = React.useState(false);
  const [comment, setComment] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // ✅ Format due date
  const dueDate = task?.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "No Due Date";

  // ✅ Calculate days left
  let daysLeftText = "No due date";
  let daysLeftColor = theme.palette.text.secondary;
  let DaysLeftIcon = EventAvailableIcon;
  let isOverdue = false;

  if (task?.dueDate) {
    const due = new Date(task.dueDate);
    const today = new Date();
    const diffTime = due.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 3) {
      daysLeftText = `${diffDays} days left`;
      daysLeftColor = theme.palette.success.main;
      DaysLeftIcon = EventAvailableIcon;
    } else if (diffDays > 0 && diffDays <= 3) {
      daysLeftText = `${diffDays} day${diffDays > 1 ? "s" : ""} left`;
      daysLeftColor = theme.palette.warning.main;
      DaysLeftIcon = AccessTimeIcon;
    } else if (diffDays === 0) {
      daysLeftText = `Due today`;
      daysLeftColor = theme.palette.info.main;
      DaysLeftIcon = CheckCircleIcon;
    } else {
      daysLeftText = `Overdue by ${Math.abs(diffDays)} day${
        Math.abs(diffDays) > 1 ? "s" : ""
      }`;
      daysLeftColor = theme.palette.error.main;
      DaysLeftIcon = WarningAmberIcon;
      isOverdue = true;
    }
  }

  // ✅ Comment handler
  const handleCommentSubmit = () => {
    if (comment.trim()) {
      onComment?.(task.id, comment.trim());
      setComment("");
      setIsCommenting(false);
    }
  };

  const handleEdit = () => onUpdate?.(task);
  const handleDeleteClick = () => setConfirmOpen(true);
  const confirmDelete = () => {
    onDelete?.(task.id);
    setConfirmOpen(false);
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          p: 1.5,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(30,30,30,0.85)"
              : "rgba(255,255,255,0.95)",
          border:
            theme.palette.mode === "dark"
              ? "1px solid rgba(255,255,255,0.15)"
              : "1px solid rgba(0,0,0,0.05)",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 2px 8px rgba(0,0,0,0.6)"
              : "0 2px 8px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 4px 20px rgba(255,255,255,0.08)"
                : "0 4px 20px rgba(0,0,0,0.08)",
          },
          animation: isOverdue
            ? `${shakeAnimation} 0.5s ease-in-out infinite alternate`
            : "none",
        }}
      >
        <CardContent>
          {/* 🔹 Title + Actions */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                overflowWrap: "anywhere",
              }}
            >
              {task.title || "Untitled Task"}
            </Typography>

            {/* 🧩 Admin actions */}
            {role === "admin" && (
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Edit Task">
                  <IconButton size="small" color="primary" onClick={handleEdit}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Task">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={handleDeleteClick}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>

          {/* 📝 Description */}
          {task.description && (
            <Typography
              variant="body2"
              sx={{ mt: 0.5, color: theme.palette.text.secondary }}
            >
              {task.description}
            </Typography>
          )}

          <Divider sx={{ my: 1 }} />

          {/* 📅 Due Date + Priority + Assigned To */}
          <Stack direction="column" spacing={0.5} sx={{ mb: 1 }}>
            <Stack direction="row" spacing={2}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                🗓 Due: {dueDate}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                ⚙️ Priority: {task.priority || "N/A"}
              </Typography>
            </Stack>

            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              👤 Assigned To: {task.assignedToEmail || "Unassigned"}
            </Typography>

            {/* ⏳ Days Left Indicator */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.8}
              sx={{ mt: 0.5 }}
            >
              <DaysLeftIcon
                fontSize="small"
                sx={{ color: daysLeftColor, verticalAlign: "middle" }}
              />
              <Typography
                variant="caption"
                sx={{ color: daysLeftColor, fontWeight: 600 }}
              >
                {daysLeftText}
              </Typography>
            </Stack>
          </Stack>

          {/* 🏷 Status */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color:
                task.status === "Done"
                  ? theme.palette.success.main
                  : task.status === "In Progress"
                  ? theme.palette.warning.main
                  : theme.palette.text.secondary,
            }}
          >
            Status: {task.status || "To Do"}
          </Typography>

          {/* 💬 Comments */}
          <Box sx={{ mt: 2 }}>
            {Array.isArray(task.comments) && task.comments.length > 0 && (
              <Box
                sx={{
                  mb: 1.5,
                  maxHeight: 120,
                  overflowY: "auto",
                  pr: 1,
                }}
              >
                <Stack spacing={1.2}>
                  {task.comments.map((c) => (
                    <Box
                      key={c.id}
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        background:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.04)",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                        }}
                      >
                        {c.authorName || "Anonymous"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                      >
                        {new Date(c.createdAt).toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, color: theme.palette.text.primary }}
                      >
                        {c.text || c.comment || c.message || "(No text provided)"}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {!isCommenting ? (
              <Button
                size="small"
                startIcon={<CommentIcon />}
                onClick={() => setIsCommenting(true)}
                sx={{ textTransform: "none", fontSize: "0.8rem" }}
              >
                {task.comments?.length ? "Add another comment" : "Add Comment"}
              </Button>
            ) : (
              <Stack spacing={1}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  multiline
                  minRows={2}
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleCommentSubmit}
                    disabled={!comment.trim()}
                  >
                    Post
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setIsCommenting(false)}
                    color="error"
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* ⚠️ Delete Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background:
              theme.palette.mode === "dark"
                ? "rgba(30,30,30,0.8)"
                : "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
          },
        }}
      >
        <DialogTitle>Delete Task?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{task.title || "this task"}</strong>? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
