import React, { useState } from "react";
import {
  Typography,
  Box,
  Grid,
  Paper,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTasks } from "../contexts/TasksContext.jsx";

const COLORS = {
  Done: "#10B981",
  InProgress: "#F59E0B",
  ToDo: "#3B82F6",
};

export default function Analytics() {
  const { user, role } = useAuth();
  const { tasks, loading } = useTasks();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [selectedUser, setSelectedUser] = useState("all");

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const userName = user?.name || "User";

  if (loading)
    return (
      <Typography sx={{ textAlign: "center", mt: 4 }}>
        Loading analytics...
      </Typography>
    );

  if (!tasks?.length)
    return (
      <Typography sx={{ textAlign: "center", mt: 4 }}>
        No tasks available for analytics.
      </Typography>
    );

  const userList = [...new Set(tasks.map((t) => t.assignedToEmail).filter(Boolean))];
  const filteredTasks =
    selectedUser === "all"
      ? tasks
      : tasks.filter((t) => t.assignedToEmail === selectedUser);

  const statusCounts = {
    Done: filteredTasks.filter((t) => t.status === "Done").length,
    InProgress: filteredTasks.filter((t) => t.status === "In Progress").length,
    ToDo: filteredTasks.filter((t) => t.status === "To Do").length,
  };
  const totalTasks = filteredTasks.length;

  const statusData = Object.keys(statusCounts)
    .map((key) => ({ name: key, value: statusCounts[key] }))
    .filter((d) => d.value > 0);

  const groupedByDate = {};
  filteredTasks.forEach((t) => {
    if (!t.dueDate || isNaN(new Date(t.dueDate))) return;
    const dateKey = new Date(t.dueDate).toISOString().split("T")[0];
    if (!groupedByDate[dateKey])
      groupedByDate[dateKey] = { date: dateKey, Done: 0, "In Progress": 0, "To Do": 0 };
    if (t.status && groupedByDate[dateKey][t.status] !== undefined)
      groupedByDate[dateKey][t.status] += 1;
  });
  const timelineData = Object.values(groupedByDate).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const performanceData = userList.map((email) => {
    const userTasks = tasks.filter((t) => t.assignedToEmail === email);
    return {
      email,
      Done: userTasks.filter((t) => t.status === "Done").length,
      InProgress: userTasks.filter((t) => t.status === "In Progress").length,
      ToDo: userTasks.filter((t) => t.status === "To Do").length,
    };
  });

  const bgColor =
    theme.palette.mode === "dark"
      ? "linear-gradient(135deg, #0f172a, #1e293b)"
      : "linear-gradient(135deg, #f8fafc, #e2e8f0)";
  const cardColor = theme.palette.mode === "dark" ? "#1e293b" : "#fff";
  const textPrimary = theme.palette.mode === "dark" ? "#E2E8F0" : "#1E293B";

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
        background: bgColor,
        borderRadius: 3,
      }}
    >
      {/* Greeting */}
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            fontWeight: 700,
            background: "linear-gradient(135deg, #6366F1 0%, #A855F7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {greeting}, {userName}
        </Typography>
      </Box>

      {/* Summary + Filter */}
      <Paper
        elevation={3}
        sx={{
          mb: 4,
          borderRadius: 3,
          p: 2,
          backgroundColor: cardColor,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <SummaryBadge title="Total" value={totalTasks} color="#6366F1" />
          <SummaryBadge title="To Do" value={statusCounts.ToDo} color={COLORS.ToDo} />
          <SummaryBadge
            title="In Progress"
            value={statusCounts.InProgress}
            color={COLORS.InProgress}
          />
          <SummaryBadge title="Done" value={statusCounts.Done} color={COLORS.Done} />
        </Stack>

        {role === "admin" && (
          <FormControl
            size={isMobile ? "small" : "medium"}
            sx={{
              minWidth: isMobile ? 180 : 220,
              backgroundColor: cardColor,
              borderRadius: 2,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <InputLabel>Filter by User</InputLabel>
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              label="Filter by User"
            >
              <MenuItem value="all">All Users</MenuItem>
              {userList.map((email) => (
                <MenuItem key={email} value={email}>
                  {email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Paper>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartContainer title="📊 Task Status Distribution" cardColor={cardColor}>
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 250}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 70 : 85}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={18} />
                <RTooltip formatter={(v) => `${v} tasks`} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartContainer title="📈 Task Timeline (Due Dates)" cardColor={cardColor}>
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 250}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <RTooltip />
                <Legend verticalAlign="bottom" height={18} />
                <Area
                  type="monotone"
                  dataKey="Done"
                  stroke={COLORS.Done}
                  fill={COLORS.Done}
                  fillOpacity={0.25}
                />
                <Area
                  type="monotone"
                  dataKey="In Progress"
                  stroke={COLORS.InProgress}
                  fill={COLORS.InProgress}
                  fillOpacity={0.25}
                />
                <Area
                  type="monotone"
                  dataKey="To Do"
                  stroke={COLORS.ToDo}
                  fill={COLORS.ToDo}
                  fillOpacity={0.25}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>

        {role === "admin" && (
          <Grid item xs={12}>
            <ChartContainer
              title="🏆 Individual Performance Overview"
              cardColor={cardColor}
            >
              <ResponsiveContainer width="100%" height={isMobile ? 260 : 280}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis
                    dataKey="email"
                    tick={{ fontSize: 9 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 9 }} />
                  <RTooltip />
                  <Legend verticalAlign="bottom" height={18} />
                  <Bar dataKey="ToDo" fill={COLORS.ToDo} name="To Do" />
                  <Bar dataKey="InProgress" fill={COLORS.InProgress} name="In Progress" />
                  <Bar dataKey="Done" fill={COLORS.Done} name="Done" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

/* Summary Badge */
const SummaryBadge = ({ title, value, color }) => (
  <Box
    sx={{
      backgroundColor: "transparent",
      border: `2px solid ${color}`,
      borderRadius: 2,
      px: 2,
      py: 1,
      minWidth: 85,
      textAlign: "center",
    }}
  >
    <Typography sx={{ fontSize: 12, color: color }}>{title}</Typography>
    <Typography sx={{ fontWeight: 700, color }}>{value}</Typography>
  </Box>
);

/* Chart Wrapper */
const ChartContainer = ({ title, children, cardColor }) => (
  <Paper
    elevation={4}
    sx={{
      p: 2,
      borderRadius: 3,
      backgroundColor: cardColor,
      transition: "0.3s",
      "&:hover": { transform: "translateY(-3px)", boxShadow: 6 },
      minHeight: 240,
    }}
  >
    <Typography
      variant="subtitle1"
      sx={{
        mb: 1,
        color: "#818CF8",
        fontWeight: 600,
        fontSize: { xs: 14, sm: 16 },
      }}
    >
      {title}
    </Typography>
    <Box sx={{ width: "100%", height: "100%" }}>{children}</Box>
  </Paper>
);
