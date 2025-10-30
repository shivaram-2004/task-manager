import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Stack,
  Typography,
} from "@mui/material";

function CommentItem({ comment, replies }) {
  return (
    <ListItem alignItems="flex-start" sx={{ pl: comment.parentId ? 4 : 0 }}>
      <ListItemText
        primary={
          <Typography variant="subtitle2">
            {comment.authorName} · {new Date(comment.createdAt).toLocaleString()}
          </Typography>
        }
        secondary={comment.text}
      />
      {replies}
    </ListItem>
  );
}

export default function CommentsThread({ open, onClose, task, onComment }) {
  const [text, setText] = React.useState("");

  const tree = React.useMemo(() => {
    const byParent = {};
    task.comments.forEach((c) => {
      byParent[c.parentId || "root"] = byParent[c.parentId || "root"] || [];
      byParent[c.parentId || "root"].push(c);
    });

    function render(parentId = "root") {
      return (byParent[parentId] || []).map((c) => (
        <React.Fragment key={c.id}>
          <CommentItem comment={c} replies={<List disablePadding>{render(c.id)}</List>} />
        </React.Fragment>
      ));
    }
    return render();
  }, [task.comments]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Comments — {task.title}</DialogTitle>
      <DialogContent dividers>
        <List>{tree}</List>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: "100%" }}>
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            fullWidth
            size="small"
            placeholder="Write a comment…"
          />
          <Button
            variant="contained"
            onClick={() => {
              if (!text.trim()) return;
              onComment(text.trim(), null);
              setText("");
            }}
          >
            Add
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
