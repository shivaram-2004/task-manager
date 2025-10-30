// ===================================== 
// Mock REST API for Task Manager
// =====================================
// • Handles auth (login/signup)
// • Task CRUD (create/read/update/delete)
// • Comments
// • Activity logging
// • Analytics helpers
// =====================================

import LS from "./storage";
import { format } from "date-fns";

const USERS_KEY = "ttm_users";
const TASKS_KEY = "ttm_tasks";
const ACTIVITY_KEY = "ttm_activity";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function delay(ms = 200) {
  return new Promise((res) => setTimeout(res, ms));
}

// =====================================
// MAIN API OBJECT
// =====================================
export const api = {
  // ---------- AUTH ----------
  async signup({ name, email, password, role = "member" }) {
    await delay();
    const users = LS.get(USERS_KEY, []);
    if (users.find((u) => u.email === email))
      throw new Error("Email already exists");

    const user = { id: uid("usr"), name, email, password, role };
    users.push(user);
    LS.set(USERS_KEY, users);

    return { id: user.id, name, email, role };
  },

  async login({ email, password }) {
    await delay();
    const users = LS.get(USERS_KEY, []);
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) throw new Error("Invalid credentials");
    return { id: found.id, name: found.name, email: found.email, role: found.role };
  },

  // ---------- TASKS ----------
  async listTasks(user) {
    await delay();
    const tasks = LS.get(TASKS_KEY, []);

    // 🧠 Admin sees all tasks
    if (user.role === "admin") return tasks;

    // 👤 Member sees only tasks assigned to their email
    return tasks.filter((t) => t.assignees?.includes(user.email));
  },

  async createTask(input, actor) {
    await delay();
    const tasks = LS.get(TASKS_KEY, []);

    const task = {
      id: uid("tsk"),
      title: input.title,
      description: input.description || "",
      status: input.status || "To Do",
      dueDate: input.dueDate || null,
      priority: input.priority || "Medium",
      // Store email for assignees since we're frontend-only
      assignees: input.assignees || [input.assignedToEmail],
      comments: [],
      activity: [],
      createdBy: actor.email, // Admin email
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(task);
    LS.set(TASKS_KEY, tasks);

    pushActivity({
      type: "create",
      taskId: task.id,
      actor,
      message: `created task “${task.title}” for ${input.assignedToEmail}`,
    });

    return task;
  },

  async updateTask(id, changes, actor) {
    await delay();
    const tasks = LS.get(TASKS_KEY, []);
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Task not found");

    const before = tasks[idx];
    const after = { ...before, ...changes, updatedAt: new Date().toISOString() };
    tasks[idx] = after;
    LS.set(TASKS_KEY, tasks);

    const diffMsg = Object.keys(changes).join(", ");
    pushActivity({
      type: "update",
      taskId: id,
      actor,
      message: `updated ${diffMsg}`,
    });

    return after;
  },

  async deleteTask(id, actor) {
    await delay();
    const tasks = LS.get(TASKS_KEY, []);
    const t = tasks.find((x) => x.id === id);
    LS.set(TASKS_KEY, tasks.filter((t) => t.id !== id));

    pushActivity({
      type: "delete",
      taskId: id,
      actor,
      message: `deleted task “${t?.title || id}”`,
    });

    return true;
  },

  // ---------- COMMENTS ----------
  async addComment(taskId, text, actor, parentId = null) {
  await delay();
  const tasks = LS.get(TASKS_KEY, []);
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) throw new Error("Task not found");

  const comment = {
    id: uid("cmt"),
    taskId,
    text,                 // ✅ must use the variable text
    authorId: actor.id,
    authorName: actor.name,
    parentId,
    createdAt: new Date().toISOString(),
  };

  const task = tasks[idx];
  task.comments = Array.isArray(task.comments)
    ? [...task.comments, comment]
    : [comment];
  task.updatedAt = new Date().toISOString();

  tasks[idx] = task;
  LS.set(TASKS_KEY, tasks);
  return comment;         // ✅ must return this
},


  // ---------- ANALYTICS ----------
  async listAllTasks() {
    await delay();
    return LS.get(TASKS_KEY, []);
  },

  async listActivity() {
    await delay();
    return LS.get(ACTIVITY_KEY, []);
  },
};

// ---------- INTERNAL HELPERS ----------
function pushActivity({ type, taskId, actor, message }) {
  const items = LS.get(ACTIVITY_KEY, []);
  const newActivity = {
    id: uid("act"),
    type,
    taskId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    message,
    at: new Date().toISOString(),
    pretty: format(new Date(), "PPpp"),
  };
  items.unshift(newActivity);
  LS.set(ACTIVITY_KEY, items);
}
