import React from "react";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Paper, Stack, TextField, Button, Typography, Alert } from "@mui/material";
import { motion } from "framer-motion"; // 👈 for subtle fade animation

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
    alert("✅ Logged in successfully!");
    nav("/");
  } catch (error) {
    console.error(error);
    setErr(error.message);
  }
};


  return (
    <Paper
      sx={{
        maxWidth: 420,
        mx: "auto",
        p: 4,
        mt: 8,
        borderRadius: 3,
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}
    >
      {/* 🌟 New Welcome Heading */}
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
          Welcome Back 
        </Typography>
      </motion.div>

      {/* Existing Login Heading */}
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center", fontWeight: 600 }}>
        Login
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
          error={!password && !!err}
          helperText={!password && err ? "Password is required" : ""}
          fullWidth
        />

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
          Login
        </Button>

        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
          No account?{" "}
          <Button component={RouterLink} to="/signup" variant="text" size="small">
            Sign up
          </Button>
        </Typography>
        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
        <Button component={RouterLink} to="/forgot-password" variant="text" size="small">
          Forgot Password?
        </Button>
      </Typography>

      </Stack>
    </Paper>
  );
}
