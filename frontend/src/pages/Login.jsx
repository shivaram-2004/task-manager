import React from "react";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
} from "@mui/material";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState("");
  const [emailError, setEmailError] = React.useState("");

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return "Email is required";
    if (!emailRegex.test(value)) return "Invalid email format";
    return "";
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const submit = async () => {
    try {
      await login(email, password);
      nav("/");
    } catch (error) {
      console.error(error);
      setErr(error.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(145deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)",
        p: { xs: 2, md: 6 },
      }}
    >
      {/* Left Section - Branding */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          borderRadius: "24px",
          background:
            "linear-gradient(145deg, rgba(240,244,248,0.7), rgba(255,255,255,0.9))",
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.05)",
          p: 6,
          mr: 4,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: "linear-gradient(90deg, #2563eb, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Task Manager
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              fontWeight: 400,
              lineHeight: 1.6,
              maxWidth: 420,
              mx: "auto",
            }}
          >
            Manage your team's productivity, stay organized, and meet deadlines —
            all in one simple dashboard.
          </Typography>
        </motion.div>
      </Box>

      {/* Right Section - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 5,
            width: "100%",
            maxWidth: 420,
            borderRadius: 4,
            backgroundColor: "#ffffff",
            boxShadow:
              "0 10px 25px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.03)",
          }}
          component={motion.div}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: "#2563eb",
            }}
          >
            Welcome Back
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{
              mb: 3,
              fontWeight: 500,
              color: "text.secondary",
            }}
          >
            Login to continue managing your tasks
          </Typography>

          <Stack spacing={2}>
            {err && <Alert severity="error">{err}</Alert>}

            <TextField
              label="Email"
              value={email}
              onChange={handleEmailChange}
              error={!!emailError}
              helperText={emailError || ""}
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />

            <Button
              variant="contained"
              onClick={submit}
              sx={{
                mt: 1,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                background: "linear-gradient(90deg, #2563eb, #3b82f6)",
                "&:hover": {
                  background: "linear-gradient(90deg, #1d4ed8, #2563eb)",
                  boxShadow: "0 6px 20px rgba(37,99,235,0.25)",
                },
              }}
            >
              Login
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              No account?{" "}
              <Button
                component={RouterLink}
                to="/signup"
                variant="text"
                size="small"
                sx={{
                  color: "#2563eb",
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                Sign Up
              </Button>
            </Typography>

            <Typography variant="body2" align="center" sx={{ mt: -1 }}>
              <Button
                component={RouterLink}
                to="/forgot-password"
                variant="text"
                size="small"
                sx={{
                  color: "#2563eb",
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Forgot Password?
              </Button>
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
