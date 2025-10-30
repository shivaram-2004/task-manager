// utils/activityLogger.js
export const logActivity = (user, action, task, type = "updated") => {
  const activity = JSON.parse(localStorage.getItem("activity_log") || "[]");

  const newEntry = {
    id: Date.now(),
    user,
    action,
    task,
    type,
    date: new Date().toISOString(),
  };

  const updated = [newEntry, ...activity].slice(0, 100); // keep latest 100 logs
  localStorage.setItem("activity_log", JSON.stringify(updated));
};
