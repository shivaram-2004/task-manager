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
  Divider,
  Avatar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
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

      // 👥 Admin-only routes
      ...(role === "admin"
        ? [
            { label: "Activity Log", path: "/activity" },
            { label: "Users", path: "/users" },
            { label: "Teams", path: "/teams", icon: <GroupsIcon /> },
            { label: "Analytics", path: "/analytics" },
          ]
        : []),

      // 👤 Member-only routes
      ...(role === "member"
        ? [
            {
              label: "Team Tasks",
              path: "/team-tasks",
              icon: <GroupsIcon />, // reuse the same icon for teams
            },
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
            {navItems.map(({ label, path, icon }) => (
              <Button
                key={label}
                component={RouterLink}
                to={path}
                color="inherit"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {icon}
                {label}
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

        {/* 📱 Modern Mobile Navigation */}
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
                  width: "80%",
                  background:
                    mode === "dark"
                      ? "linear-gradient(135deg, #111827, #1e293b)"
                      : "linear-gradient(135deg, #f8fafc, #e0f2fe)",
                  color: mode === "dark" ? "#f1f5f9" : "#1e293b",
                  borderTopLeftRadius: "16px",
                  borderBottomLeftRadius: "16px",
                  p: 3,
                },
              }}
            >
              {/* Header with user info */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar
                    sx={{
                      bgcolor:
                        mode === "dark" ? "primary.light" : "primary.main",
                      color: "#fff",
                    }}
                  >
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user?.name || "User"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: mode === "dark" ? "#94a3b8" : "#475569" }}
                    >
                      {user?.email}
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => setOpenDrawer(false)} sx={{ color: "inherit" }}>
                  <CloseIcon />
                </IconButton>
              </Stack>

              <Divider sx={{ my: 2, opacity: 0.3 }} />

              {/* Navigation Items */}
              <List>
                {navItems.map((item) => (
                  <ListItem key={item.label} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(item.path);
                        setOpenDrawer(false);
                      }}
                      sx={{
                        borderRadius: "12px",
                        mb: 1,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background:
                            mode === "dark"
                              ? "rgba(96,165,250,0.15)"
                              : "rgba(59,130,246,0.15)",
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <Box sx={{ mr: 2, color: "#3b82f6" }}>{item.icon}</Box>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}

                <Divider sx={{ my: 2, opacity: 0.3 }} />

                <ListItemButton onClick={toggleColorMode}>
                  <Box sx={{ mr: 2 }}>
                    {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                  </Box>
                  <ListItemText
                    primary={mode === "dark" ? "Light Mode" : "Dark Mode"}
                  />
                </ListItemButton>

                <ListItemButton onClick={() => navigate("/settings")}>
                  <Box sx={{ mr: 2 }}>
                    <SettingsIcon />
                  </Box>
                  <ListItemText primary="Settings" />
                </ListItemButton>

                <ListItemButton onClick={handleLogout}>
                  <Box sx={{ mr: 2 }}>
                    <LogoutIcon />
                  </Box>
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
