import React from "react";
import { Box, Typography, Paper, Switch, FormControlLabel } from "@mui/material";
import { motion } from "framer-motion";

export default function Settings() {
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        p: 4,
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(66,165,245,0.1), rgba(30,136,229,0.1))",
        backdropFilter: "blur(12px)",
      }}
    >
      <Paper
        elevation={5}
        sx={{
          p: 4,
          maxWidth: 600,
          mx: "auto",
          borderRadius: 3,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 700,
            background: "linear-gradient(90deg, #4169E1, #1E90FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
          }}
        >
          ⚙️ Settings
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#4169E1",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#4169E1",
                },
              }}
            />
          }
          label="Enable Dark Mode"
        />

        <Typography variant="body2" sx={{ mt: 3, color: "gray" }}>
          More settings coming soon — like notifications, user preferences, and integrations.
        </Typography>
      </Paper>
    </Box>
  );
}
