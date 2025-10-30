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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";

export default function FiltersBar({
  filters,
  onChange,
  onReset,
  onNewTask,
  showCreateButton = true,
}) {
  const theme = useTheme();

  const handleStatusChange = (event, newStatus) => {
    // prevent deselect (always one active)
    onChange((f) => ({ ...f, status: newStatus || "" }));
  };

  return (
    <Box
      sx={{
        mb: 3,
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #1e293b, #0f172a)"
            : "linear-gradient(135deg, #ffffff, #f8fafc)",
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 2px 10px rgba(255,255,255,0.1)"
            : "0 4px 12px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* 🔍 Filters Grid */}
        <Grid item xs={12} md={10}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            flexWrap="wrap"
            useFlexGap
          >
            {/* 🔎 Search */}
            <TextField
              value={filters.q}
              onChange={(e) => onChange((f) => ({ ...f, q: e.target.value }))}
              placeholder="Search by title or description"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 230,
                "& .MuiOutlinedInput-root": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "#fff",
                  borderRadius: 2,
                },
              }}
            />

            {/* 🧩 Status Buttons */}
            <ToggleButtonGroup
  value={filters.status || ""}
  exclusive
  onChange={handleStatusChange}
  size="small"
  sx={{
    borderRadius: 2,
    flexWrap: "wrap",
    gap: 1.2, // ✅ adds spacing between buttons
    "& .MuiToggleButton-root": {
      textTransform: "none",
      borderRadius: 2,
      px: 2.5,
      py: 0.8,
      border: "1px solid",
      borderColor:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.1)"
          : "rgba(0,0,0,0.1)",
      color: theme.palette.text.primary,
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.05)",
      },
      "&.Mui-selected": {
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
        boxShadow: "0 2px 6px rgba(59,130,246,0.4)",
        "&:hover": {
          backgroundColor: theme.palette.primary.dark,
        },
      },
    },
  }}
>
  <ToggleButton value="">All</ToggleButton>
  <ToggleButton value="To Do">To Do</ToggleButton>
  <ToggleButton value="In Progress">In Progress</ToggleButton>
  <ToggleButton value="Done">Done</ToggleButton>
</ToggleButtonGroup>


            {/* ⚙️ Priority */}
            <TextField
              select
              label="Priority"
              size="small"
              value={filters.priority}
              onChange={(e) =>
                onChange((f) => ({ ...f, priority: e.target.value }))
              }
              sx={{ minWidth: 150 }}
            >
              {["", "High", "Medium", "Low"].map((p) => (
                <MenuItem key={p} value={p}>
                  {p || "All"}
                </MenuItem>
              ))}
            </TextField>

            {/* 📅 Due Date From */}
           

            {/* 📅 Due Date To */}
            

            {/* 🔄 Reset */}
            <Button
              variant="outlined"
              onClick={onReset}
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                textTransform: "none",
                color: theme.palette.text.primary,
                borderColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0,0,0,0.3)",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.04)",
                },
              }}
            >
              RESET
            </Button>
          </Stack>
        </Grid>

        {/* ➕ Create Task Button */}
        
      </Grid>
    </Box>
  );
}
