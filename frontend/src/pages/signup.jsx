import React from "react";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem,
  LinearProgress,
  Box,
} from "@mui/material";
import { motion } from "framer-motion";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "member",
  });
  const [err, setErr] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [passwordMatchError, setPasswordMatchError] = React.useState("");
  const [strength, setStrength] = React.useState({
    label: "Weak",
    value: 0,
    color: "error",
  });

  // ✅ Email Validation
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return "Email is required";
    if (!emailRegex.test(value)) return "Invalid email format";
    return "";
  };

  // ✅ Password Strength Checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { label: "Weak", value: 33, color: "error" };
    if (score === 3 || score === 4)
      return { label: "Medium", value: 66, color: "warning" };
    return { label: "Strong", value: 100, color: "success" };
  };

  // ✅ Handle Field Changes
  const handle = (k) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [k]: value }));

    if (k === "password") {
      setStrength(checkPasswordStrength(value));
      setPasswordMatchError(
        form.confirmPassword && form.confirmPassword !== value
          ? "Passwords do not match"
          : ""
      );
    }

    if (k === "confirmPassword") {
      setPasswordMatchError(
        value !== form.password ? "Passwords do not match" : ""
      );
    }

    if (k === "email") setEmailError(validateEmail(value));
  };

  // ✅ Submit Handler
  const submit = async () => {
    setErr("");

    // Form validation before signup
    if (!form.email || !form.password) {
      setErr("Email and password are required.");
      return;
    }

    if (emailError) {
      setErr("Please enter a valid email address.");
      return;
    }

    if (passwordMatchError) {
      setErr("Passwords do not match.");
      return;
    }

    try {
      await signup(form.email, form.password, form.role);
 // ✅ fixed variable references
      alert("✅ Account created successfully!");
      nav("/login");
    } catch (error) {
      console.error(error);
      setErr(error.message || "Signup failed. Please try again.");
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
      {/* 🌈 Gradient Heading */}
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
          Welcome Aboard!
        </Typography>
      </motion.div>

      <Typography
        variant="h5"
        sx={{ mb: 2, textAlign: "center", fontWeight: 600 }}
      >
        Create Account
      </Typography>

      <Stack spacing={2}>
        {err && <Alert severity="error">{err}</Alert>}

        <TextField
          label="Name"
          value={form.name}
          onChange={handle("name")}
          required
          fullWidth
        />

        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={handle("email")}
          error={!!emailError}
          helperText={emailError || ""}
          required
          fullWidth
        />

        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={handle("password")}
          helperText="Use at least 8 characters including numbers, symbols, and uppercase letters"
          required
          fullWidth
        />

        {form.password && (
          <Box>
            <LinearProgress
              variant="determinate"
              value={strength.value}
              color={strength.color}
              sx={{ height: 8, borderRadius: 1, mb: 0.5 }}
            />
            <Typography variant="body2" color={`${strength.color}.main`}>
              Strength: {strength.label}
            </Typography>
          </Box>
        )}

        <TextField
          label="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={handle("confirmPassword")}
          error={!!passwordMatchError}
          helperText={passwordMatchError || ""}
          required
          fullWidth
        />

        <TextField
          select
          label="Role"
          value={form.role}
          onChange={handle("role")}
          fullWidth
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="member">Member</MenuItem>
        </TextField>

        {/* ✅ Submit Button */}
        <Button
          variant="contained"
          onClick={submit}
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
          Sign Up
        </Button>

        {/* 🔗 Login link */}
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Button
            component={RouterLink}
            to="/login"
            variant="text"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Login
          </Button>
        </Typography>
      </Stack>
    </Paper>
  );
}
