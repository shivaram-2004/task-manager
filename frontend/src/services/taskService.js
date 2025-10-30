// src/services/taskService.js
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  arrayUnion,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * 🔹 Fetch all tasks (admin) or only assigned tasks (member)
 */
export const fetchTasks = async (user) => {
  const tasksRef = collection(db, "tasks");
  let q;

  if (user.role === "admin") {
    q = query(tasksRef, orderBy("createdAt", "desc"));
  } else {
    q = query(tasksRef, where("assignedToEmail", "==", user.email));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * 🔹 Create a new task
 */
export const createTask = async (task, user) => {
  const newTask = {
    ...task,
    createdBy: user.email,
    createdAt: serverTimestamp(),
    comments: [],
  };
  const docRef = await addDoc(collection(db, "tasks"), newTask);
  const snap = await getDoc(docRef);
  return { id: docRef.id, ...snap.data() };
};

/**
 * 🔹 Update a task
 */
export const updateTask = async (id, updates) => {
  const ref = doc(db, "tasks", id);
  await updateDoc(ref, updates);
  return { id, ...updates };
};

/**
 * 🔹 Delete a task
 */
export const deleteTask = async (id) => {
  const ref = doc(db, "tasks", id);
  await deleteDoc(ref);
};

/**
 * 🔹 Add a comment to a task
 */
export const addComment = async (taskId, text, user) => {
  const ref = doc(db, "tasks", taskId);
  const newComment = {
    id: Date.now().toString(),
    authorName: user.email,
    text,
    createdAt: new Date().toISOString(),
  };
  await updateDoc(ref, { comments: arrayUnion(newComment) });
  return newComment;
};
