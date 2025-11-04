import React from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  MenuItem,
  InputAdornment,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";

export default function FiltersBar({
  filters = {},
  onChange,
  onReset,
  onNewTask,
  showCreateButton = true,
  setFilters,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:900px)");

  // ✅ Universal filter updater
  const updateFilters = (updater) => {
    const fn =
      typeof onChange === "function"
        ? onChange
        : typeof setFilters === "function"
        ? setFilters
        : null;

    if (!fn) {
      console.warn("No valid filter update function provided");
      return;
    }

    if (updater instanceof Function) fn(updater);
    else fn((prev) => ({ ...prev, ...updater }));
  };

  const handleStatusChange = (event, newStatus) => {
    updateFilters({ status: newStatus || "" });
  };

  return (
    <Box
      sx={{
        width: "100%",
        mb: 3,
        position: "relative", // ✅ allows FAB to anchor properly
        background: "transparent",
        boxShadow: "none",
        zIndex: 10, // ✅ ensures it stays above TaskBoard
      }}
    >
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* 🔍 Filters + Buttons */}
        <Grid item xs={12}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            flexWrap="wrap"
            useFlexGap
            sx={{ alignItems: "center" }}
          >
            {/* Search Field */}
            <TextField
              value={filters.q || ""}
              onChange={(e) => updateFilters({ q: e.target.value })}
              placeholder="Search by title or description"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#64748b" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 250,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  background:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "#ffffff",
                  border:
                    theme.palette.mode === "dark"
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid #e2e8f0",
                  "& fieldset": { border: "none" },
                },
              }}
            />

            {/* Status Buttons */}
            <ToggleButtonGroup
              value={filters.status || ""}
              exclusive
              onChange={handleStatusChange}
              size="small"
              sx={{
                borderRadius: 2.5,
                flexWrap: "wrap",
                gap: 1,
                "& .MuiToggleButton-root": {
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  border: "1px solid",
                  borderColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.12)"
                      : "#e2e8f0",
                  color: theme.palette.mode === "dark" ? "#cbd5e1" : "#475569",
                  "&.Mui-selected": {
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                    color: "#ffffff",
                    borderColor: "transparent",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                  },
                },
              }}
            >
              <ToggleButton value="">All</ToggleButton>
              <ToggleButton value="To Do">To Do</ToggleButton>
              <ToggleButton value="In Progress">In Progress</ToggleButton>
              <ToggleButton value="Done">Done</ToggleButton>
            </ToggleButtonGroup>

            {/* Priority Dropdown */}
            <TextField
              select
              label="Priority"
              size="small"
              value={filters.priority || ""}
              onChange={(e) => updateFilters({ priority: e.target.value })}
              sx={{
                minWidth: 150,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  background:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "#ffffff",
                  border:
                    theme.palette.mode === "dark"
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid #e2e8f0",
                },
              }}
            >
              {["", "High", "Medium", "Low"].map((p) => (
                <MenuItem key={p} value={p}>
                  {p || "All Priorities"}
                </MenuItem>
              ))}
            </TextField>

            {/* Reset Button */}
            <Button
              variant="outlined"
              onClick={onReset}
              sx={{
                borderRadius: 2.5,
                px: 3,
                py: 1,
                fontWeight: 600,
                textTransform: "none",
                color: theme.palette.mode === "dark" ? "#cbd5e1" : "#475569",
                borderColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.12)"
                    : "#e2e8f0",
                "&:hover": {
                  borderColor: "#3b82f6",
                  color: "#2563eb",
                },
              }}
            >
              Reset
            </Button>

            {/* Create Task (Desktop Only) */}
            {!isMobile &&
              showCreateButton &&
              typeof onNewTask === "function" && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onNewTask}
                  sx={{
                    borderRadius: 2.5,
                    px: 4,
                    py: 1.2,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    textTransform: "none",
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                    color: "#ffffff",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Create Task
                </Button>
              )}
          </Stack>
        </Grid>
      </Grid>

      {/* ✅ Floating Button (Mobile Only) */}
      {isMobile &&
        showCreateButton &&
        typeof onNewTask === "function" && (
          <Fab
            color="primary"
            onClick={onNewTask}
            sx={{
              position: "fixed",
              bottom: 80, // ✅ increased from 24 to 80 (above last card)
              right: 24,
              zIndex: 1300, // ✅ stays above everything
              width: 64,
              height: 64,
              background:
                "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
              color: "#fff",
              boxShadow: "0 8px 24px rgba(37, 99, 235, 0.4)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
                transform: "scale(1.05)",
              },
              "&:active": {
                transform: "scale(0.95)",
              },
            }}
          >
            <AddIcon sx={{ fontSize: 28 }} />
          </Fab>
        )}
    </Box>
  );
}
