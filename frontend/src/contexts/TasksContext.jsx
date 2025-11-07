import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "./AuthContext.jsx";

const TasksContext = createContext();
export const useTasks = () => useContext(TasksContext);
export default function TasksProvider({ children }) {
  const { user, role } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Log activity (task created, updated, deleted, commented)
  const logActivity = async (type, action, taskTitle = "") => {
    try {
      await addDoc(collection(db, "activityLogs"), {
        type, // e.g., "created", "updated", "deleted", "commented"
        action,
        taskTitle,
        actorName: user?.name || "Unknown User",
        actorEmail: user?.email || "unknown@example.com",
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  // ✅ Real-time fetch (admin → all tasks; member → assigned only)
  useEffect(() => {
    // 🔒 wait until both user and role are ready
    if (!user || !role) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const tasksRef = collection(db, "tasks");
    let unsubscribeAll = () => {};

    if (role === "admin") {
      const q = query(tasksRef, orderBy("createdAt", "desc"));
      const unsub = onSnapshot(
        q,
        (snap) => {
          setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        },
        (err) => {
          console.error("🔥 Firestore (admin tasks) error:", err);
          setLoading(false);
        }
      );
      unsubscribeAll = unsub;
    } else {
      const q1 = query(tasksRef, where("assignedToEmails", "array-contains", user.email));
      const q2 = query(tasksRef, where("assignedToEmail", "==", user.email));

      const unsub1 = onSnapshot(
        q1,
        (snap1) => {
          const list1 = snap1.docs.map((d) => ({ id: d.id, ...d.data() }));

          const unsub2 = onSnapshot(
            q2,
            (snap2) => {
              const list2 = snap2.docs.map((d) => ({ id: d.id, ...d.data() }));
              const merged = [...list1, ...list2].filter(
                (v, i, a) => a.findIndex((t) => t.id === v.id) === i
              );
              setTasks(merged);
              setLoading(false);
            },
            (err) => console.error("🔥 Firestore (member q2) error:", err)
          );

          unsubscribeAll = () => {
            unsub1();
            unsub2();
          };
        },
        (err) => console.error("🔥 Firestore (member q1) error:", err)
      );
    }

    return () => unsubscribeAll();
  }, [user, role]);




  // ✅ Create Task (multi-user)
  const createTask = async (values) => {
  try {
    const assignedList = Array.isArray(values.assignedToEmails)
      ? values.assignedToEmails
      : values.assignedToEmail
      ? [values.assignedToEmail]
      : [];

    const newTask = {
      ...values,
      assignedToEmails: assignedList,
      assignedToEmail: assignedList[0] || "", // ✅ ensure exists
      createdAt: serverTimestamp(),
      createdBy: user?.email || "unknown@example.com",
      comments: [],
    };

    const docRef = await addDoc(collection(db, "tasks"), newTask);
    await logActivity("created", "Created a new task", values.title);
    return docRef;
  } catch (err) {
    console.error("Error creating task:", err);
    throw err;
  }
};

  // ✅ Update Task
  const updateTask = async (id, updatedValues) => {
    try {
      const taskRef = doc(db, "tasks", id);
      await updateDoc(taskRef, {
        ...updatedValues,
        assignedToEmails: Array.isArray(updatedValues.assignedToEmails)
          ? updatedValues.assignedToEmails
          : updatedValues.assignedToEmail
          ? [updatedValues.assignedToEmail]
          : [],
      });

      await logActivity("updated", "Updated task details", updatedValues.title);
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  };

  // ✅ Delete Task
  const deleteTask = async (id) => {
    try {
      const task = tasks.find((t) => t.id === id);
      await deleteDoc(doc(db, "tasks", id));
      await logActivity("deleted", "Deleted a task", task?.title || "Unknown Task");
    } catch (err) {
      console.error("Error deleting task:", err);
      throw err;
    }
  };

  // ✅ Add Comment (logs comment + updates Firestore)
  const addComment = async (taskId, commentText) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) throw new Error("Task not found");

      const newComment = {
        id: Date.now().toString(),
        text: commentText || "(No comment text)",
        authorEmail: user?.email || "unknown@example.com",
        authorName: user?.name || "Anonymous",
        createdAt: new Date().toISOString(),
      };

      const cleanComment = Object.fromEntries(
        Object.entries(newComment).filter(([_, v]) => v !== undefined)
      );

      const updatedComments = [...(task.comments || []), cleanComment];
      await updateDoc(doc(db, "tasks", taskId), { comments: updatedComments });

      await logActivity("commented", "Added a comment", task.title);
      console.log("✅ Comment added successfully!");
    } catch (err) {
      console.error("Error adding comment:", err);
      throw err;
    }
  };

  // ✅ Provide context
  const value = {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    addComment,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}
