import React from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function ActivityLog() {
  const theme = useTheme();
  const { user, role } = useAuth();
  const [activities, setActivities] = React.useState([]);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!user || role !== "admin") return;

    const q = query(collection(db, "activityLogs"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setActivities(logs);
    });

    return () => unsubscribe();
  }, [user, role]);

  const filtered = activities.filter(
    (log) =>
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName?.toLowerCase().includes(search.toLowerCase())
  );

  if (role !== "admin") {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h5" color="text.secondary">
          🔒 Access Denied
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Only administrators can view the activity log.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        px: { xs: 3, md: 6 },
        py: 4,
        color: theme.palette.text.primary,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          🕒 My Activity Log
        </Typography>
        <TextField
          placeholder="Search activity..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 260 }}
        />
      </Stack>

      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 3,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(25,25,25,0.9)"
              : "rgba(255,255,255,0.95)",
        }}
      >
        {filtered.length === 0 ? (
          <Typography sx={{ textAlign: "center", color: "text.secondary", py: 5 }}>
            No activity found.
          </Typography>
        ) : (
          <List disablePadding>
            {filtered.map((act, i) => (
              <motion.div
                key={act.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 500 }}>
                        {act.action || "Performed an action"}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {act.actorName || "Unknown"} —{" "}
                        {act.timestamp
                          ? new Date(act.timestamp.toDate()).toLocaleString()
                          : ""}
                      </Typography>
                    }
                  />
                </ListItem>
                {i < filtered.length - 1 && <Divider />}
              </motion.div>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
