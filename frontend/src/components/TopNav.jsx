import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Stack,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useColorMode } from "../theme";

export default function TopNav() {
  const { user, role, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const theme = useTheme();
  const navigate = useNavigate();

  const isMobile = useMediaQuery("(max-width:900px)");
  const [openDrawer, setOpenDrawer] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
    ...(role === "admin"
      ? [
          { label: "Activity Log", path: "/activity" },
          { label: "Users", path: "/users" },
          { label: "Analytics", path: "/analytics" },
        ]
      : []),
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 16,
        mx: "auto",
        width: "96%",
        borderRadius: "18px",
        p: { xs: "4px 8px", sm: "6px 14px" },
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background:
          mode === "dark"
            ? "rgba(15, 15, 20, 0.55)"
            : "rgba(255, 255, 255, 0.4)",
        boxShadow:
          mode === "dark"
            ? "0 4px 20px rgba(0,0,0,0.4)"
            : "0 4px 20px rgba(0,0,0,0.1)",
        border:
          mode === "dark"
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(255,255,255,0.5)",
        color: mode === "dark" ? "#e5e7eb" : "#1e1e1e",
        transition: "all 0.3s ease-in-out",
        zIndex: 1000,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: { xs: 1, md: 2 },
        }}
      >
        {/* 🌈 Logo + Title */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component="img"
            src="/Task_image.png"
            alt="Task Manager Logo"
            sx={{
              height: { xs: 36, sm: 42 },
              width: "auto",
              mr: 1.2,
              filter:
                mode === "dark"
                  ? "drop-shadow(0 0 4px rgba(255,255,255,0.6))"
                  : "drop-shadow(0 0 4px rgba(0,0,0,0.15))",
              transition: "transform 0.3s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1rem", sm: "1.2rem" },
              letterSpacing: 0.5,
              background:
                mode === "dark"
                  ? "linear-gradient(90deg,#60a5fa,#a78bfa)"
                  : "linear-gradient(90deg,#3b82f6,#06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow:
                mode === "dark"
                  ? "0 1px 3px rgba(255,255,255,0.15)"
                  : "0 1px 3px rgba(0,0,0,0.2)",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            Task Manager
          </Typography>
        </Box>

        {/* 🧭 Desktop Navigation */}
        {!isMobile && user && (
          <Stack direction="row" spacing={1.2} alignItems="center">
            {navItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                startIcon={item.icon}
                component={RouterLink}
                to={item.path}
                sx={navBtnStyle(mode)}
              >
                {item.label}
              </Button>
            ))}

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mx: 1,
                display: { xs: "none", sm: "block" },
              }}
            >
              {user?.name || user?.email}
            </Typography>
            <IconButton onClick={toggleColorMode} sx={iconStyle(mode)}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton onClick={() => navigate("/settings")} sx={iconStyle(mode)}>
              <SettingsIcon />
            </IconButton>
            <IconButton onClick={handleLogout} sx={iconStyle(mode)}>
              <LogoutIcon />
            </IconButton>
          </Stack>
        )}

        {/* 📱 Mobile Navigation */}
        {isMobile && user && (
          <>
            <IconButton onClick={() => setOpenDrawer(true)} sx={iconStyle(mode)}>
              <MenuIcon />
            </IconButton>

            <Drawer
              anchor="right"
              open={openDrawer}
              onClose={() => setOpenDrawer(false)}
              PaperProps={{
                sx: {
                  width: "75%",
                  background:
                    mode === "dark"
                      ? "rgba(20,20,25,0.95)"
                      : "rgba(255,255,255,0.95)",
                  p: 2,
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: mode === "dark" ? "#e5e7eb" : "#1e1e1e",
                  }}
                >
                  Menu
                </Typography>
                <IconButton onClick={() => setOpenDrawer(false)}>
                  <CloseIcon />
                </IconButton>
              </Stack>

              <List>
                {navItems.map((item) => (
                  <ListItem key={item.label} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(item.path);
                        setOpenDrawer(false);
                      }}
                    >
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
                <ListItemButton onClick={toggleColorMode}>
                  <ListItemText
                    primary={mode === "dark" ? "Light Mode" : "Dark Mode"}
                  />
                </ListItemButton>
                <ListItemButton onClick={() => navigate("/settings")}>
                  <ListItemText primary="Settings" />
                </ListItemButton>
                <ListItemButton onClick={handleLogout}>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </List>
            </Drawer>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

/* 🎨 Dynamic Button Style (Light/Dark adaptive) */
const navBtnStyle = (mode) => ({
  color: mode === "dark" ? "#e5e7eb" : "#1e1e1e",
  fontWeight: 500,
  textTransform: "none",
  borderRadius: "10px",
  px: 2,
  "&:hover": {
    background:
      mode === "dark"
        ? "linear-gradient(90deg, rgba(96,165,250,0.15), rgba(167,139,250,0.15))"
        : "linear-gradient(90deg, rgba(59,130,246,0.15), rgba(6,182,212,0.15))",
  },
  transition: "all 0.3s ease",
});

/* 🌟 Icon Button Style (Adaptive) */
const iconStyle = (mode) => ({
  color: mode === "dark" ? "#e5e7eb" : "#1e1e1e",
  "&:hover": {
    color: mode === "dark" ? "#60a5fa" : "#0284c7",
    transform: "scale(1.1)",
    transition: "all 0.2s ease-in-out",
  },
});
