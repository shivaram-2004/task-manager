import React from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = React.useState("");
  const [err, setErr] = React.useState("");
  const [msg, setMsg] = React.useState("");
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

  const handleSubmit = async () => {
    setErr("");
    setMsg("");

    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    try {
      await resetPassword(email);
      setMsg("A password reset link has been sent to your email.");
      setTimeout(() => nav("/login"), 4000);
    } catch (e) {
      setErr(e.message || "Failed to send reset link. Please try again.");
    }
  };

  return (
    <Paper
      sx={{
        maxWidth: 480,
        mx: "auto",
        p: 4,
        mt: 8,
        borderRadius: 3,
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 700,
            mb: 1,
            letterSpacing: 0.5,
            background: "linear-gradient(90deg, #007bff, #00d4ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Forgot Password?
        </Typography>
      </motion.div>

      <Typography variant="h6" sx={{ mb: 3, textAlign: "center", fontWeight: 500 }}>
        Reset Your Password
      </Typography>

      <Stack spacing={2}>
        {err && <Alert severity="error">{err}</Alert>}
        {msg && <Alert severity="success">{msg}</Alert>}

        <TextField
          label="Email Address"
          value={email}
          onChange={handleEmailChange}
          error={!!emailError}
          helperText={emailError || ""}
          fullWidth
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            mt: 1,
            py: 1,
            borderRadius: 2,
            fontWeight: 600,
            transition: "0.3s",
            "&:hover": {
              transform: "scale(1.03)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
            },
          }}
        >
          Send Reset Link
        </Button>

        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
          Remember your password?{" "}
          <Button component={RouterLink} to="/login" variant="text" size="small">
            Go back to Login
          </Button>
        </Typography>
      </Stack>
    </Paper>
  );
}
